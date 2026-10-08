export enum MovementType {
  TRANSFER = "transfer",
  SALE = "sale",
  MORTALITY = "mortality"
}

export interface MovementTank {
    id: string;
    tankNumber: number;
}

export interface MovementBatch {
    id: string;
    stockingDate: string;
}

export interface TankMovement {
    id: string;
    batchId: string;
    destinationBatchId: string | null;
    sourceTankId: string;
    destinationTankId: string | null;
    movementType: MovementType;
    quantity: number;
    notes: string | null;
    movementDate: string;
    createdAt: string;
    sourceTank: MovementTank;
    destinationTank: MovementTank | null;
    batch: MovementBatch;
    destinationBatch: MovementBatch | null;
}

export interface TankMovementGroup {
    tankId: string;
    tankNumber: number;
    quantity: number;
    movements: TankMovement[];
}

export interface OtherTankMovementGroup {
    movementType: MovementType;
    quantity: number;
    movements: TankMovement[];
}

export interface GetTankMovementsResponse {
    data: {
        tank: MovementTank;
        incoming: {
            totalQuantity: number;
            fromTanks: TankMovementGroup[];
        };
        outgoing: {
            totalQuantity: number;
            toTanks: TankMovementGroup[];
            otherMovements: OtherTankMovementGroup[];
        };
    };
}


export interface CreateTankMovementTransferPayload {
    batchId: string;
    destinationTankId: string;
    quantity: number;
    movementDate: string;

}

export interface CreateTankMovementOutflowPayload {
    batchId: string;
    movementType: MovementType;
    quantity: number;
    movementDate: string;
    notes?: string;
}