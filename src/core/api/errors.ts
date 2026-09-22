import { isAxiosError } from "axios";

export function handleApiError(error: unknown, defaultMsg: string): never {
  // Siempre imprime el error real en la consola de Expo para depuración
  console.error("[API Error Detalle]:", error);

  if (isAxiosError(error)) {
    // 1. El servidor respondió con un error (ej. 400 Bad Request, 404, 500)
    if (error.response?.data) {
      const backendMsg = error.response.data.message;
      const finalMsg = Array.isArray(backendMsg) 
          ? backendMsg.join("\n") 
          : (backendMsg ?? defaultMsg);
      throw new Error(finalMsg);
    }

    // 2. La petición se hizo pero no hubo respuesta (Error de red, IP incorrecta, CORS)
    if (error.request) {
      throw new Error(`Error de red: El servidor no responde. ¿Está encendido el backend?`);
    }
  }

  // 3. Errores desconocidos (fallos en la configuración de Axios, etc.)
  throw new Error(error instanceof Error ? error.message : defaultMsg);
}