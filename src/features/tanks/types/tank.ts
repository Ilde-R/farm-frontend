export enum TankStatus {
  ACTIVE = 'isActive',
  EMPTY =  'empty',
  MAINTENANCE = 'maintenance',
}

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

export type UpdateTankPayload = Partial<CreateTankPayload>;

export interface TankPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CirclePoint {
  x: number;
  y: number;
}
