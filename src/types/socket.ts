export interface PressureReadingData {
  psi: number;
  blowerId: string;
  blowerConfigId?: string;
  tenantId: string;
}

export interface PressureReadingEvent {
  event: "pressure_reading";
  data: PressureReadingData;
}

export interface ThresholdUpdateData {
  threshold: number;
  blowerId: string;
}

export interface ThresholdUpdateEvent {
  event: "update_threshold";
  data: ThresholdUpdateData;
}

export interface CurrentThresholdEvent {
  event: "current_threshold";
  data: { threshold: number; blowerId?: string };
}

export type WsIncomingMessage =
  PressureReadingEvent | ThresholdUpdateEvent | CurrentThresholdEvent;
