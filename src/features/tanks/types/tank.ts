export enum TankStatus {
  ACTIVE = 'isActive',
  EMPTY =  'empty',
  MAINTENANCE = 'maintenance',
}

export interface Tank {
  id: string;
  tenantId: string;
  tankNumber: number;
  tankStatus: TankStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TankResponse {
  data: Tank;
}

export interface GetTankResponse {
  data: {
    items: Tank[];
    total: number;
  };
}

export interface CreateTankPayload {
  tankNumber: number;
  tankStatus: TankStatus;
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