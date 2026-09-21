import { API_URL } from "./config";

type Listener = (data: any) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private reconnectTimer?: NodeJS.Timeout;
  private reconnectDelay = 1000;
  private readonly MAX_DELAY = 30000;
  private token: string | null = null;

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get isConnecting(): boolean {
    return this.ws?.readyState === WebSocket.CONNECTING;
  }

  connect(token: string) {
    if (this.isConnecting || (this.isConnected && this.token === token)) {
      return;
    }

    this.cleanupCurrentConnection();

    this.token = token;
    this.ws = new WebSocket(this.buildWsUrl(token));

    this.ws.onopen = () => {
      this.reconnectDelay = 1000;
      this.clearReconnectTimer();
      this.emit("connected", null);
    };

    this.ws.onmessage = (event) => this.handleMessage(event.data);

    this.ws.onclose = (e) => {
      this.emit("disconnected", null);
      if (this.token && e.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {};
  }

  disconnect() {
    this.clearReconnectTimer();
    this.token = null;
    this.cleanupCurrentConnection();
    this.emit("disconnected", null);
  }

  send(event: string, data: Record<string, unknown>) {
    if (this.isConnected) {
      this.ws!.send(JSON.stringify({ event, data }));
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

  private handleMessage(rawData: any) {
    try {
      const { event, data } = JSON.parse(rawData);
      if (event) {
        this.emit(event, data);
      }
    } catch {
    }
  }

  private buildWsUrl(token: string): string {
    const baseUrl = (API_URL || "").trim().replace(/\/api\/v1\/?$/, "");
    return `${baseUrl.replace(/^http/, "ws")}/?token=${token}`;
  }

  private cleanupCurrentConnection() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close(1000);
      this.ws = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || !this.token) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      if (this.token) this.connect(this.token);
    }, this.reconnectDelay);

    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.MAX_DELAY);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }
}

export const socketService = new SocketService();