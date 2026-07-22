import { useStorageState } from "@/hooks/useStorageState";
import {
  AuthResponse,
  LoginPayload,
  LoginReponse,
  RegisterPayload,
  User,
} from "@/types/auth";
import { createContext, use, type PropsWithChildren } from "react";

interface AuthContextType {
  signIn: (data: RegisterPayload) => Promise<void>;
  login: (data: LoginPayload) => Promise<void>;
  signOut: () => Promise<void>;
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

  const user = userRaw ? JSON.parse(userRaw) : null;

  return (
    <AuthContext.Provider
      value={{
        signIn: async (data: RegisterPayload) => {
          const { register } = await import("@/services/auth.service");
          const response: AuthResponse = await register(data);
          setToken(response.access_token);
          setUser(JSON.stringify(response.user));
        },
        login: async (data: LoginPayload) => {
          const { login: loginUser } = await import("@/services/auth.service");
          const response: LoginReponse = await loginUser(data);
          setToken(response.access_token);
          setUser(
            JSON.stringify({
              id: response.id,
              username: response.username,
              email: response.email,
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
