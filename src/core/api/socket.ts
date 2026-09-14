import { API_URL } from "./config";

type Listener = (data: any) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxDelay = 30000;
  private _isConnected = false;
  private _isConnecting = false;
  private _token: string | null = null;

  get isConnected() {
    return this._isConnected;
  }

  connect(token: string) {
    if (this._isConnecting || (this._isConnected && this._token === token)) {
      return;
    }

    if (this.ws) {
      this._isConnected = false;
      this._isConnecting = false;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }

    this._token = token;
    this._isConnecting = true;
    const wsUrl = API_URL.replace(/^http/, "ws") + `?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this._isConnected = true;
      this._isConnecting = false;
      this.reconnectDelay = 1000;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      this.emit("connected", null);
    };

    this.ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        this.emit(raw.event, raw.data);
      } catch {}
    };

    this.ws.onclose = (e) => {
      this._isConnected = false;
      this._isConnecting = false;
      this.emit("disconnected", null);
      if (this._token && e.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this._isConnecting = false;
    };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this._token = null;
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this._isConnected = false;
    this._isConnecting = false;
  }

  send(event: string, data: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  on(event: string, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((listener) => listener(data));
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || !this._token) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this._token) {
        this.connect(this._token);
      }
    }, this.reconnectDelay);

    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxDelay);
  }
}

export const socketService = new SocketService();
