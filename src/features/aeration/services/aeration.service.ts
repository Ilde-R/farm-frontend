
import { api } from "@/core/api/axios.config";
import { handleApiError } from "@/core/api/errors";
import {
  GetThresholdResponse,
  type Aeration,
  type ConfigureEspPayload,
  type CreateAerationPayload,
  type CreateAerationResponse,
  type UpdateAerationPayload,
  type UpdateAerationResponse,
} from "../types/aeration";

const ESP32_BASE = "http://192.168.4.1";

export async function createAerationDeviceService(
  data: CreateAerationPayload
): Promise<CreateAerationResponse['data']> {
  try {
    const response = await api.post<CreateAerationResponse>('/aerations/provision', data);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Error al aprovisionar el equipo");
  }
}

export async function configureEsp32Service(data: ConfigureEspPayload): Promise<void> {
  try {
    const response = await fetch(`${ESP32_BASE}/configure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al configurar el dispositivo ESP32");
    }
  } catch (error) {
    console.error("[Hardware] Error de conexión directa con ESP32:", error);
    throw error;
  }
}

export async function getAerationDevicesService(): Promise<Aeration[]> {
  try {
    const response = await api.get<{ data: Aeration[] }>('/aerations/devices');
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Error al obtener la lista de dispositivos");
  }
}

export async function updateAerationConfigService(
  blowerId: string,
  data: UpdateAerationPayload
): Promise<UpdateAerationResponse['data']> {
  try {
    const response = await api.patch<UpdateAerationResponse>(
      `/aerations/blowers/${blowerId}/config`, 
      data
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Error al actualizar la configuración del equipo");
  }
}

export async function deleteAerationDeviceService(blowerId: string): Promise<void> {
  try {
    await api.delete(`/aerations/blowers/${blowerId}`);
  } catch (error) {
    handleApiError(error, "Error al eliminar el equipo");
  }
}

export async function getAerationThresholdService(blowerId: string): Promise<number> {
  try {
    const response = await api.get<GetThresholdResponse>(`aerations/blowers/${blowerId}/threshold`);
    return response.data.data.currentThreshold;
  } catch (error) {
    handleApiError(error, 'Error al obtener el umbral');
  }
}