export enum BatchStatus {
    ACTIVE = 'isActive',
    HARVESTED = 'harvested',
}

export interface Batch {
    id: string;
    tankId: string;
    stockingDate: string;
    initialQuantity: number;
    currentQuantity: number;
    harvestedDate?: string | null;
    batchesStatus: BatchStatus | string;
    createdAt: string;
    tank: {
        id: string;
        tankNumber: number;
    }
}

export interface GetBatchResponse {
    data: {
        items: Batch[];
        total: number;
    }
}

export interface CreateBatchPayload {
    tankId: string;
    initialQuantity: number;
    stockingDate: string;
}

export interface CreateBatchResponse {
    data: Batch;
}