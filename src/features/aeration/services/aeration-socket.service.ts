import { API_URL } from "@/core/api/config";
import { WsEventType } from "@/features/aeration/types/aeration-socket";

type Listener<T = any> = (data: T) => void;

class AerationSocketService {
  private ws: WebSocket | null = null;
  private listeners = new Map<WsEventType, Set<Listener>>();
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
      this.emit(WsEventType.CONNECTED, null);
    };

    this.ws.onmessage = (event) => this.handleMessage(event.data);

    this.ws.onclose = (e) => {
      this.emit(WsEventType.DISCONNECTED, null);
      if (this.token && e.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.warn("[WebSocket] Error de conexión:", error);
    };
  }

  disconnect() {
    this.clearReconnectTimer();
    this.token = null;
    this.cleanupCurrentConnection();
    this.emit(WsEventType.DISCONNECTED, null);
  }

  send<T = Record<string, unknown>>(event: WsEventType, data: T) {
    if (this.isConnected) {
      this.ws!.send(JSON.stringify({ event, data }));
    } else {
      console.warn(`[WebSocket] Intento de enviar evento ${event} sin conexión.`);
    }
  }

  on<T = any>(event: WsEventType, listener: Listener<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as Listener);
  }

  off<T = any>(event: WsEventType, listener: Listener<T>) {
    this.listeners.get(event)?.delete(listener as Listener);
  }

  private emit(event: WsEventType, data: any) {
    this.listeners.get(event)?.forEach((listener) => listener(data));
  }

  private handleMessage(rawData: any) {
    try {
      const parsed = JSON.parse(rawData);
      const event = parsed.event as WsEventType;
      const data = parsed.data;

      if (event) {
        this.emit(event, data);
      }
    } catch (error) {
      console.warn("[WebSocket] Error al parsear mensaje JSON:", error);
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

export const aerationSocketService = new AerationSocketService();