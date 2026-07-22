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
