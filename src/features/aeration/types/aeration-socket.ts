export enum WsEventType {
  PRESSURE_READING = 'pressure_reading',
}

export interface PressureReading {
  psi: number;
  blowerId: string;
  tenantId: string;
  blowerConfigId?: string;
  deviceTs?: number;
}

export interface PressureReadingEvent {
  event: WsEventType.PRESSURE_READING;
  data: PressureReading;
}

export type WsIncomingMessage = PressureReadingEvent;