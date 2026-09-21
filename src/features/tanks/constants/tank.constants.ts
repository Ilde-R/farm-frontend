import { TankStatus } from "../types/tank";

export const TANK_STATUS_LABELS: Record<TankStatus, string> = {
    [TankStatus.ACTIVE]: 'Active',
    [TankStatus.EMPTY]: 'Vacio',
    [TankStatus.MAINTENANCE]: 'Mantenimiento',
}

export const TANK_STATUS_CONFIG: Record<TankStatus, { form: "sowing" | "daily"; label: string }> = {
  [TankStatus.ACTIVE]: {
    form: 'daily',
    label: 'Activo'
  },
  [TankStatus.EMPTY]: {
    form: 'sowing',
    label: 'Vacío'
  },
  [TankStatus.MAINTENANCE]: {
    form: 'sowing',
    label: 'Mantenimiento'
  }
};