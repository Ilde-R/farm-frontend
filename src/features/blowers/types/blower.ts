export interface ProvisionPayload {
  blowerId: string;
  blowerName: string;
}

export interface ProvisionResponse {
  deviceKey: string;
  blowerConfigId: string;
  blowerId: string;
  tenantId: string;
  currentThreshold: number;
}

export interface ConfigureEspPayload {
  ssid: string;
  pass: string;
  deviceKey: string;
}

export interface DeviceInfo {
  id: string;
  key: string;
  isActive: boolean;
  blowerConfigId: string;
  blowerConfig: {
    blowerId: string;
    name: string;
    firmwareVersion?: string;
    wifiRssi?: number;
    uptimeMs?: number;
    freeHeap?: number;
    readIntervalMs?: number;
    scaleFactor?: number;
    saveIntervalSeconds: number;
  };
}

export interface UpdateBlowerConfigPayload {
  saveIntervalSeconds: number;
}

export interface BlowerConfigResponse {
  id: string;
  tenantId: string;
  blowerId: string;
  name: string;
  currentThreshold: number;
  firmwareVersion: string;
  wifiRssi: number;
  uptimeMs: number;
  freeHeap: number;
  readIntervalMs: number;
  scaleFactor: number;
  saveIntervalSeconds: number;
  lastSaveAt: string;
  lastAlertState: boolean;
}
