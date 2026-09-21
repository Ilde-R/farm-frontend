import { useStorageState } from "@/core/hooks/useStorageState";
import { loginService, logoutService, registerService } from "@/features/auth/services/auth.service";
import {
  LoginPayload,
  LoginReponse,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "@/features/auth/types/auth";
import { updateProfile } from "@/features/users/services/user.service";
import { createContext, use, type PropsWithChildren } from "react";

interface AuthContextType {
  signIn: (data: RegisterPayload) => Promise<void>;
  login: (data: LoginPayload) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: UpdateProfilePayload) => Promise<void>;
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
  
  const [[, refreshToken], setRefreshToken] = useStorageState("auth_refresh_token");
  
  const user = userRaw ? JSON.parse(userRaw) : null;

  return (
    <AuthContext.Provider
      value={{
        //Registrarse
        signIn: async (data: RegisterPayload) => {
          const response = await registerService(data);
          setToken(response.access_token);
          setRefreshToken(response.refresh_token);
          setUser(JSON.stringify({
              id: response.id,
              username: response.username,
              email: response.email,
              tenantId: response.tenantId,
          }));
        },
        //Iniciar sesion
        login: async (data: LoginPayload) => {
          const response: LoginReponse = await loginService(data);
          setToken(response.access_token);
          setRefreshToken(response.refresh_token);
          setUser(JSON.stringify({
              id: response.id,
              username: response.username,
              email: response.email,
              tenantId: response.tenantId,
          }));
        },
        //Cerrar sesion
        signOut: async () => {
          if (token) {
            try {
              await logoutService();
            } catch {
              // limpiar local aunque el backend falle
            }
          }
          setToken(null);
          setUser(null);
          setRefreshToken(null);
        },
        //Actiualizar usuario
        updateUser: async (data: UpdateProfilePayload) => {
          if (!token) throw new Error("No autenticado");
          const response = await updateProfile(data);
          setUser(JSON.stringify({
              id: response.id,
              username: response.username,
              email: response.email,
          }));
        },
        token,
        user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}