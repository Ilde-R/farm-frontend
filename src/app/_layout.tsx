import { SplashScreenController } from "@/components/splash-screen-controller";
import { SessionProvider, useSession } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { Stack } from "expo-router";

console.log("[BOOT] _layout.tsx module loaded");

function RootNavigator() {
  const { token } = useSession();
  console.log("[BOOT] RootNavigator token=", token ? "exists" : "null");

  return (
    <Stack>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  console.log("[BOOT] RootLayout rendered");
  return (
    <SessionProvider>
      <SocketProvider>
        <SplashScreenController />
        <RootNavigator />
      </SocketProvider>
    </SessionProvider>
  );
}
