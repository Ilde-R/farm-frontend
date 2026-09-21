export enum TankStatus {
  ACTIVE = 'isActive',
} // falta agregar mas estados

export interface CreateTankPayload {
  tankNumber: number;
  tankStatus: TankStatus;
}

export interface TankResponse {
  id: string,
  tenantId: string,
  tankNumber: number,
  tankStatus: TankStatus,
  createdAt: string,
  updatedAt: string,
}

export interface GetTankResponse {
  data: {
    items: TankResponse[],
    total: number
  }
}