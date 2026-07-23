import { API_URL } from "@/api/config";
import type { ConfigureEspPayload, DeviceInfo, ProvisionPayload, ProvisionResponse } from "@/types/blower";

const ESP32_BASE = "http://192.168.4.1";

export async function provisionBlower(
  token: string,
  data: ProvisionPayload,
): Promise<ProvisionResponse> {
  const response = await fetch(`${API_URL}/iot/provision`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = Array.isArray(error.message)
      ? error.message.join("\n")
      : (error.message ?? `Error ${response.status}: ${response.statusText}`);
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function configureEsp32(
  data: ConfigureEspPayload,
): Promise<void> {
  const response = await fetch(`${ESP32_BASE}/configure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error al configurar el dispositivo");
  }
}

export async function listDevices(token: string): Promise<DeviceInfo[]> {
  const response = await fetch(`${API_URL}/iot/devices`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Error al obtener dispositivos");
  }

  return response.json();
}


