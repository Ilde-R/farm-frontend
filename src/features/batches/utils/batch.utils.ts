import { Batch, BatchStatus } from "../types/batch";

export function getActiveBatchByTankId(batches: Batch[]): Map<string, Batch> {
    const activeBatches = batches
        .filter((batch) => batch.batchesStatus === BatchStatus.ACTIVE)
        .sort(
            (first, second) =>
                new Date(second.stockingDate).getTime() -
                new Date(first.stockingDate).getTime(),
        );
    const batchesByTankId = new Map<string, Batch>();

    for (const batch of activeBatches) {
        if (!batchesByTankId.has(batch.tankId)) {
            batchesByTankId.set(batch.tankId, batch);
        }
    }

    return batchesByTankId;
}
