import { isAxiosError } from "axios";

export function handleApiError(error: unknown, defaultMsg: string): never {
  if (isAxiosError(error) && error.response?.data) {
    const backendMsg = error.response.data.message;
    const finalMsg = Array.isArray(backendMsg) 
        ? backendMsg.join("\n") 
        : (backendMsg ?? defaultMsg);
    throw new Error(finalMsg);
  }
  throw new Error(defaultMsg);
}