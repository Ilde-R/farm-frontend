import { api } from "@/core/api/axios.config";
import { handleApiError } from "@/core/api/errors";
import { CreateTankMovementOutflowPayload, CreateTankMovementTransferPayload, GetTankMovementsResponse, TankMovement } from "../types/tank-movement";

export async function createTankMovementTransferService(data: CreateTankMovementTransferPayload): Promise<TankMovement>{
    try {
        const response = await api.post('tank-movements/transfers', data)
        return response.data.data;
    } catch (error) {
        handleApiError(error, 'Error al registrar la transferencia')
    }
}

export async function createTankMovementOutflowsService(data: CreateTankMovementOutflowPayload): Promise<TankMovement> {
    try {
        const response = await api.post('tank-movements/outflows', data)
        return response.data.data
    } catch (error) {
        handleApiError(error, 'Error al registra el movimiento')        
    }
}

export async function getTankMovementService(
    tankId: string,
    filters?: { from?: string; to?: string },
): Promise<GetTankMovementsResponse> {
    try {
        const response = await api.get(`/tanks/${tankId}/movements`, {
            params: filters,
        });
        return response.data;
    } catch (error) {
        handleApiError(error, 'Error al obtener los movimientos')
    }
}