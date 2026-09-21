import { api } from "@/core/api/axios.config";
import { handleApiError } from "@/core/api/errors";
import type {
  Auth,
  AuthResponse,
  LoginPayload,
  RegisterPayload
} from "@/features/auth/types/auth";

export async function registerService(data: RegisterPayload): Promise<Auth> {
  try {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data.data; 
  } catch (error) {
    handleApiError(error, "Error al registrar");
  }
}

export async function loginService(data: LoginPayload): Promise<Auth> {
  try {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Error al iniciar sesión");
  }
}

export async function logoutService(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    handleApiError(error, "Error al cerrar sesión");
  }
}