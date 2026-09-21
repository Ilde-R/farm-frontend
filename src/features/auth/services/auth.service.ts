import { API_URL } from "@/core/api/config";
import type {
  AuthResponse,
  LoginPayload,
  LoginReponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  RegisterPayload,
} from "@/features/auth/types/auth";

export async function registerService(data: RegisterPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = Array.isArray(error.message)
      ? error.message.join("\n")
      : (error.message ?? "Error al registrar");
    throw new Error(errorMsg);
  }

  const json = await response.json();
  return json.data;
}

export async function loginService(data: LoginPayload): Promise<LoginReponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = Array.isArray(error.message)
      ? error.message.join("\n")
      : (error.message ?? "Error al iniciar sesión");
    throw new Error(errorMsg);
  }

  const json = await response.json();
  return json.data;
}

export async function logoutService(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = Array.isArray(error.message)
      ? error.message.join("\n")
      : (error.message ?? "Error al cerrar sesión");
    throw new Error(errorMsg);
  }
}

export async function refreshTokenService(
  data: RefreshTokenPayload,
): Promise<RefreshTokenResponse> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = Array.isArray(error.message)
      ? error.message.join("\n")
      : (error.message ?? "Error al renovar token");
    throw new Error(errorMsg);
  }

  const json = await response.json();
  return json.data;
}
