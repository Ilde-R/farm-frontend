import { API_URL } from "@/core/api/config";
import { CreateTankPayload, GetTankResponse, TankResponse, UpdateTankPayload } from "../types/tank";

export async function createTankService(data: CreateTankPayload, token: string): Promise<TankResponse> {
  const response = await fetch(`${API_URL}/tanks`, {
    method: "POST",
    headers: {  "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
     },
    body: JSON.stringify(data),
  });

  if(!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = Array.isArray(error.message)
        ? error.message.join("\n")
        : (error.message ?? "Error al registrar");
    throw new Error(errorMsg);
  }

  const json = await response.json();
  return json.data;
}

export async function getTanksService(token: string): Promise <GetTankResponse> {
  const response = await fetch(`${API_URL}/tanks`, {
    method: "GET",
    headers: {"Context-Type":"application/json",
              "Authorization": `Bearer ${token}`
    },
  });
  if(!response.ok){
    const errorData = await response.json().catch(()=> ({}));
    throw new Error(errorData.message || "Error al cargar los tanques")
  }
  const json = await response.json();
  return json;
}

export async function updateTankService(tankId: string, data: UpdateTankPayload, token: string): Promise<TankResponse>{
  const response = await fetch(`${API_URL}/tanks/${tankId}`, {
    method: "PATCH",
    headers: {  "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if(!response.ok){
    const errorData = await response.json().catch(() => ({}));
     throw new Error(errorData.message || "Error al actualizar el tanque")
  }
  const json = await response.json();
  return json;
}