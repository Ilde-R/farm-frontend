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
  access_token: string;
  user: User;
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
