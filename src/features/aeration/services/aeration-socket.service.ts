import { API_URL } from "@/core/api/config";
import {
  WsEventType,
  type PressureReading,
} from "@/features/aeration/types/aeration-socket";

type Listener = (data: PressureReading) => void;

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
    };

    this.ws.onmessage = (event) => this.handleMessage(event.data);

    this.ws.onclose = (e) => {
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
  }

  on(event: WsEventType, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: WsEventType, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: WsEventType, data: PressureReading) {
    this.listeners.get(event)?.forEach((listener) => listener(data));
  }

  private handleMessage(rawData: any) {
    try {
      const parsed = JSON.parse(rawData);
      if (parsed.event === WsEventType.PRESSURE_READING) {
        this.emit(WsEventType.PRESSURE_READING, parsed.data as PressureReading);
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