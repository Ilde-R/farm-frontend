import { API_URL } from "@/api/config";
import type {
  BlowerConfigResponse,
  ConfigureEspPayload,
  DeviceInfo,
  ProvisionPayload,
  ProvisionResponse,
  UpdateBlowerConfigPayload,
} from "@/types/blower";

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

  const json = await response.json();
  return json.data;
}

export async function configureEsp32(data: ConfigureEspPayload): Promise<void> {
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

  const json = await response.json();
  return json.data;
}

export async function deleteBlower(
  token: string,
  blowerId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/iot/blowers/${blowerId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = Array.isArray(error.message)
      ? error.message.join("\n")
      : (error.message ?? `Error ${response.status}: ${response.statusText}`);
    throw new Error(errorMsg);
  }
}

export async function updateBlowerConfig(
  token: string,
  blowerId: string,
  data: UpdateBlowerConfigPayload,
): Promise<BlowerConfigResponse> {
  const response = await fetch(`${API_URL}/iot/blowers/${blowerId}/config`, {
    method: "PATCH",
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

  const json = await response.json();
  return json.data;
} 
