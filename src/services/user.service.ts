import { API_URL } from "@/api/config";
import { UpdateProfilePayload } from "@/types/auth";

export async function getProfile(token: string) {
  const response = await fetch(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
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

export async function updateProfile(
  token: string,
  data: UpdateProfilePayload,
) {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      username: data.username,
      email: data.email,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = Array.isArray(error.message)
      ? error.message.join("\n")
      : (error.message ?? "Error al actualizar");
    throw new Error(errorMsg);
  }

  const json = await response.json();
  return json.data;
}
