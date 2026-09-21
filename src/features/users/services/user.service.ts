import { api } from "@/core/api/axios.config";
import { handleApiError } from "@/core/api/errors";
import { UpdateProfilePayload } from "@/features/auth/types/auth";

export async function getProfile() {
  try {
    const response = await api.get("/users/profile");
    return response.data; 
  } catch (error) {
    handleApiError(error, "Error al obtener el perfil");
  }
}

export async function updateProfile(data: UpdateProfilePayload) {
  try {
    const response = await api.patch("/users/profile", data);
    
    return response.data.data; 
  } catch (error) {
    handleApiError(error, "Error al actualizar el perfil");
  }
}