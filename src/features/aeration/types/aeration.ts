export interface AerationConfig {
    blowerId: string;
    name: string;
    currentThreshold: number;
    firmwareVersion?: string;
    wifiRssi?: number;
    uptimeMs?: number;
    freeHeap?: number;
    readIntervalMs?: number;
    scaleFactor?: number;
    saveIntervalSeconds: number;
    lastSaveAt?: string; 
    lastAlertState?: boolean;
}

export interface Aeration {
    id: string;
    key: string;
    isActive: boolean;
    blowerConfigId: string;
    blowerConfig: AerationConfig;
}

export interface AerationResponse {
    data: Aeration;
}

export interface CreateAerationPayload {
    blowerId: string;
    blowerName: string;
}

export interface CreateAerationResponse {
    data: {
        deviceKey: string;
        blowerConfigId: string;
        blowerId: string;
        tenantId: string;
        currentThreshold: number;
    };
}

export interface UpdateAerationPayload {
    saveIntervalSeconds?: number;
    scaleFactor?: number;
}

export interface UpdateAerationResponse {
    data: {
        id: string;
        tenantId: string;
        blowerId: string;
        name: string;
        currentThreshold: number;
        firmwareVersion?: string;
        wifiRssi?: number;
        uptimeMs?: number;
        freeHeap?: number;
        readIntervalMs?: number;
        scaleFactor?: number;
        saveIntervalSeconds: number;
        lastSaveAt?: string;
        lastAlertState?: boolean;
    };
}

export interface GetThresholdResponse {
    data: {
        blowerId: string
        currentThreshold: number
    }
}

export interface ConfigureEspPayload {
    ssid: string;
    pass: string;
    deviceKey: string;
}