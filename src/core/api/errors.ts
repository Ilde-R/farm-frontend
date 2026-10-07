import { isAxiosError } from "axios";

export function handleApiError(error: unknown, defaultMsg: string): never {
  console.error("[API Error Detalle]:", error);

  if (isAxiosError(error)) {
    if (error.response?.data) {
      const backendMsg = error.response.data.message;
      const finalMsg = Array.isArray(backendMsg) 
          ? backendMsg.join("\n") 
          : (backendMsg ?? defaultMsg);
      throw new Error(finalMsg);
    }

    if (error.request) {
      throw new Error(`El servidor no responde.`);
    }
  }

  throw new Error(error instanceof Error ? error.message : defaultMsg);
}