export const TANK_STATUS_OPTIONS = ["Activo", "Vacío"] as const;

export type TankStatus = (typeof TANK_STATUS_OPTIONS)[number];
export type TankStatusForm = "daily" | "sowing";

export type TankStatusConfig = {
  label: TankStatus;
  form: TankStatusForm;
  cardTextClass: string;
};

export const TANK_STATUS_CONFIG: Record<TankStatus, TankStatusConfig> = {
  Activo: {
    label: "Activo",
    form: "daily",
    cardTextClass: "text-emerald-400",
  },
  Vacío: {
    label: "Vacío",
    form: "sowing",
    cardTextClass: "text-gray-400",
  },
};

export function isTankStatus(value: string | undefined): value is TankStatus {
  return value !== undefined && TANK_STATUS_OPTIONS.includes(value as TankStatus);
}
