import { TankStatus } from "../types/tank";

export function isTankStatus(status: string): status is TankStatus {
  return Object.values(TankStatus).includes(status as TankStatus)
}