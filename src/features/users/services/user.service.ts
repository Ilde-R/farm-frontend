import { api } from "@/core/api/axios.config";
import { handleApiError } from "@/core/api/errors";
import { GetProfileResponse, UpdateProfilePayload, User } from "../types/users";

export async function getProfile(): Promise<User> {
  try {
    const response = await api.get<GetProfileResponse>("/users/profile");
    return response.data.data; 
  } catch (error) {
    handleApiError(error, "Error al obtener el perfil");
  }
}

export async function updateProfile(data: UpdateProfilePayload): Promise<User> {
  try {
    const response = await api.patch<GetProfileResponse>("/users/profile", data);
    return response.data.data; 
  } catch (error) {
    handleApiError(error, "Error al actualizar el perfil");
  }
}