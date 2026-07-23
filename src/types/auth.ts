export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  tenantId?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  id: string;
  username: string;
  email: string;
  access_token: string;
  refresh_token: string;
}

export interface LoginPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginReponse {
  id: string;
  username: string;
  email: string;
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}
