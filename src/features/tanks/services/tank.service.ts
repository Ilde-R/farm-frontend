import { api } from "@/core/api/axios.config";
import { handleApiError } from "@/core/api/errors";
import { CreateTankPayload, GetTankResponse, Tank, UpdateTankPayload } from "../types/tank";

export async function createTankService(data: CreateTankPayload): Promise<Tank> {
  try {
    const response = await api.post('/tanks', data)
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Error al registrar tanque')
  }
}

export async function getTanksService(): Promise <GetTankResponse> {
  try {
    const response = await api.get('/tanks');
    return response.data
  } catch (error) {
    handleApiError(error, 'Error al obtener los tanques');
  }
}

export async function updateTankService(tankId: string, data: UpdateTankPayload): Promise<Tank> {
  try {
    const response = await api.patch(`/tanks/${tankId}`, data);
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar el tanque')
  }
}