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
