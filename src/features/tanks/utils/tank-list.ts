import type { Batch } from "@/features/batches/types/batch";
import { TankStatus, type Tank } from "../types/tank";

export type TankSortOption = "numero" | "poblacion" | "siembra";

export interface TankKpis {
  total: number;
  organisms: number;
  active: number;
  empty: number;
  maintenance: number;
}

export interface TankSection {
  status: TankStatus;
  label: string;
  tanks: Tank[];
}

const MS_PER_DAY = 86_400_000;

export function getDaysInCulture(stockingDate?: string | null): number | null {
  if (!stockingDate) return null;
  const start = new Date(stockingDate);
  if (Number.isNaN(start.getTime())) return null;
  const diffMs = Date.now() - start.getTime();
  return Math.max(0, Math.floor(diffMs / MS_PER_DAY));
}

export function sortTanks(
  tanks: Tank[],
  sortBy: TankSortOption,
  activeBatchByTankId: Map<string, Batch>,
): Tank[] {
  const sorted = [...tanks];

  switch (sortBy) {
    case "poblacion":
      sorted.sort(
        (a, b) =>
          (activeBatchByTankId.get(b.id)?.currentQuantity ?? 0) -
          (activeBatchByTankId.get(a.id)?.currentQuantity ?? 0),
      );
      break;
    case "siembra":
      sorted.sort((a, b) => {
        const dateA = activeBatchByTankId.get(a.id)?.stockingDate;
        const dateB = activeBatchByTankId.get(b.id)?.stockingDate;
        return new Date(dateB ?? 0).getTime() - new Date(dateA ?? 0).getTime();
      });
      break;
    case "numero":
    default:
      sorted.sort((a, b) => a.tankNumber - b.tankNumber);
  }

  return sorted;
}

const SECTION_ORDER: TankStatus[] = [
  TankStatus.ACTIVE,
  TankStatus.EMPTY,
  TankStatus.MAINTENANCE,
];

const SECTION_LABELS: Record<TankStatus, string> = {
  [TankStatus.ACTIVE]: "Activos",
  [TankStatus.EMPTY]: "Vacíos",
  [TankStatus.MAINTENANCE]: "Mantenimiento",
};

export function groupTanksByStatus(tanks: Tank[]): TankSection[] {
  return SECTION_ORDER.map((status) => ({
    status,
    label: SECTION_LABELS[status],
    tanks: tanks.filter((tank) => tank.tankStatus === status),
  })).filter((section) => section.tanks.length > 0);
}

export function computeTankKpis(
  tanks: Tank[],
  activeBatchByTankId: Map<string, Batch>,
): TankKpis {
  let organisms = 0;
  let active = 0;
  let empty = 0;
  let maintenance = 0;

  for (const tank of tanks) {
    organisms += activeBatchByTankId.get(tank.id)?.currentQuantity ?? 0;

    if (tank.tankStatus === TankStatus.ACTIVE) active += 1;
    else if (tank.tankStatus === TankStatus.EMPTY) empty += 1;
    else if (tank.tankStatus === TankStatus.MAINTENANCE) maintenance += 1;
  }

  return { total: tanks.length, organisms, active, empty, maintenance };
}
