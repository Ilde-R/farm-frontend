import { User } from "@/features/users/types/users"

export interface Auth extends User {
  tenantId: string
  access_token: string
  refresh_token: string
}

export interface AuthResponse {
  data:Auth
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}


export interface LoginPayload {
  username: string;
  email: string;
  password: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}
export interface RefreshTokenResponse {
  data: {
    access_token: string;
    refresh_token: string;
  }
}
