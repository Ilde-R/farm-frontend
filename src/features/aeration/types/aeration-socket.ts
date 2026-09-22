export enum WsEventType {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  
  PRESSURE_READING = 'pressure_reading',
  UPDATE_THRESHOLD = 'update_threshold',
  CURRENT_THRESHOLD = 'current_threshold',
  
  DEVICE_ONLINE = 'device_online',
  DEVICE_OFFLINE = 'device_offline',
  DEVICES_ONLINE = 'devices_online',

  GET_THRESHOLD = 'get_threshold',
  SET_NEW_THRESHOLD = 'set_new_threshold',
  SET_DEVICE_CONFIG = 'set_device_config',
}

export interface PressureReading {
  psi: number;
  blowerId: string;
  tenantId: string;
  blowerConfigId?: string;
  deviceTs?: number;
}

export interface ThresholdConfig {
  threshold: number;
  blowerId?: string;
}

export interface UpdateThresholdPayload {
  threshold: number;
  blowerId: string;
}

export interface PressureReadingEvent {
  event: WsEventType.PRESSURE_READING;
  data: PressureReading;
}

export interface ThresholdUpdateEvent {
  event: WsEventType.UPDATE_THRESHOLD;
  data: UpdateThresholdPayload;
}

export interface CurrentThresholdEvent {
  event: WsEventType.CURRENT_THRESHOLD;
  data: ThresholdConfig;
}

export type WsIncomingMessage =
  | PressureReadingEvent
  | ThresholdUpdateEvent
  | CurrentThresholdEvent;