import { API_URL } from "@/api/config";
import type { RegisterPayload, AuthResponse } from "@/types/auth";

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
      : error.message ?? "Error al registrar";
    throw new Error(errorMsg);
  }

  return response.json();
}
