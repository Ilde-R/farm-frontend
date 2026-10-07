import { api } from "@/core/api/axios.config";
import { handleApiError } from "@/core/api/errors";
import { Batch, CreateBatchPayload, GetBatchResponse } from "../types/batch";

export async function createBatchService(data: CreateBatchPayload): Promise<Batch> {
    try {
        const response = await api.post('/batches', data)
        return response.data.data;
    } catch (error) {
        handleApiError(error, 'Error al registrar lote')
    }
}

export async function getBatchesService(): Promise<GetBatchResponse> {
    try {
        const response = await api.get('/batches');
        return response.data
    } catch (error) {
        handleApiError(error, 'Error al obtener lotes')
    }
}