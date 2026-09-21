import { api } from "@/core/api/axios.config";
import { API_URL } from "@/core/api/config";
import { handleApiError } from "@/core/api/errors";
import type {
  AuthResponse,
  LoginPayload,
  LoginReponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  RegisterPayload,
} from "@/features/auth/types/auth";
import axios from "axios";

export async function registerService(data: RegisterPayload): Promise<AuthResponse> {
  try {
    const response = await api.post("/auth/register", data);
    return response.data.data; 
  } catch (error) {
    handleApiError(error, "Error al registrar");
  }
}

export async function loginService(data: LoginPayload): Promise<LoginReponse> {
  try {
    const response = await api.post("/auth/login", data);
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

export async function refreshTokenService(data: RefreshTokenPayload): Promise<RefreshTokenResponse> {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh`, data);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Error al renovar token");
  }
}