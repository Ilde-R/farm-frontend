const rawApiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? "https://farm-backend.fly.dev";

export const API_URL: string = rawApiUrl.replace(/\/+$/, "");
