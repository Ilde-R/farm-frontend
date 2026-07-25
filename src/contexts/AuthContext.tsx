import { useStorageState } from "@/hooks/useStorageState";
import {
  LoginPayload,
  LoginReponse,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "@/types/auth";
import { createContext, use, type PropsWithChildren } from "react";

interface AuthContextType {
  signIn: (data: RegisterPayload) => Promise<void>;
  login: (data: LoginPayload) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: UpdateProfilePayload) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, token], setToken] = useStorageState("auth_token");
  const [[, userRaw], setUser] = useStorageState("auth_user");
  const [[, refreshToken], setRefreshToken] =
    useStorageState("auth_refresh_token");
  const user = userRaw ? JSON.parse(userRaw) : null;

  return (
    <AuthContext.Provider
      value={{
        signIn: async (data: RegisterPayload) => {
          const { register } = await import("@/services/auth.service");
          const response = await register(data);
          setToken(response.access_token);
          setRefreshToken(response.refresh_token);
          setUser(
            JSON.stringify({
              id: response.id,
              username: response.username,
              email: response.email,
              tenantId: response.tenantId,
            }),
          );
        },
        login: async (data: LoginPayload) => {
          const { login: loginUser } = await import("@/services/auth.service");
          const response: LoginReponse = await loginUser(data);
          setToken(response.access_token);
          setRefreshToken(response.refresh_token);
          setUser(
            JSON.stringify({
              id: response.id,
              username: response.username,
              email: response.email,
              tenantId: response.tenantId,
            }),
          );
        },
        signOut: async () => {
          if (token) {
            try {
              const { logout } = await import("@/services/auth.service");
              await logout(token);
            } catch {
              // limpiar local
            }
          }
          setToken(null);
          setUser(null);
          setRefreshToken(null);
        },
        token,
        user,
        isLoading,
        updateUser: async (data: UpdateProfilePayload) => {
          if (!token) throw new Error("No autenticado");
          const { updateProfile } = await import("@/services/user.service");
          const response = await updateProfile(token, data);
          setUser(
            JSON.stringify({
              id: response.id,
              username: response.username,
              email: response.email,
            }),
          );
        },
        refreshAccessToken: async () => {
          if (!refreshToken) throw new Error("No refresh token");
          const { refreshToken: refresh } =
            await import("@/services/auth.service");
          const response = await refresh(refreshToken);
          setToken(response.access_token);
          setRefreshToken(response.refresh_token);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
