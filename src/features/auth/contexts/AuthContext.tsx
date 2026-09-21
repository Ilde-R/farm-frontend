import { useStorageState } from "@/core/hooks/useStorageState";
import { loginService, logoutService, registerService } from "@/features/auth/services/auth.service";
import {
  LoginPayload,
  RegisterPayload
} from "@/features/auth/types/auth";
import { updateProfile } from "@/features/users/services/user.service";
import { UpdateProfilePayload, User } from "@/features/users/types/users";
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
        signIn: async (data: RegisterPayload) => {
          try {
            const response = await registerService(data);
            const { access_token, refresh_token, ...userData } = response;
              
            setToken(access_token);
            setRefreshToken(refresh_token);
            setUser(JSON.stringify(userData));
          } catch (error) {
             console.error('Error al registrarse', error);
             throw error;
          }
        },
        // Iniciar sesion
        login: async (data: LoginPayload) => {
          try {
            const response = await loginService(data);
            const { access_token, refresh_token, ...userData} = response;

            setToken(access_token);
            setRefreshToken(refresh_token);
            setUser(JSON.stringify(userData));
          } catch (error) {
            console.error('Error al iniciar sesion', error);
            throw error;
          }
        },
        // Cerrar sesion
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
        // Actualizar usuario
        updateUser: async (data: UpdateProfilePayload) => {
          try {
            const updatedUser = await updateProfile(data);
            setUser(JSON.stringify(updatedUser));
          } catch (error) {
            console.error('Error al actualizar el perfil', error);
            throw error;
          }
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