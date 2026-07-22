import { API_URL } from "@/api/config";
import type {
  AuthResponse,
  LoginPayload,
  LoginReponse,
  RegisterPayload,
} from "@/types/auth";

export async function register(data: RegisterPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: data.username,
      email: data.email,
      password: data.password,
      ...(data.tenantId ? { tenantId: data.tenantId } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = Array.isArray(error.message)
      ? error.message.join("\n")
      : (error.message ?? "Error al registrar");
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function login(data: LoginPayload): Promise<LoginReponse> {
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

  return response.json();
}

export async function logout(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/authlogout`, {
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
