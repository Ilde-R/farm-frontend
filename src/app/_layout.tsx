import { SplashScreenController } from "@/core/components/splash-screen-controller";
import { setupNotifications } from "@/core/utils/notifications";
import { SessionProvider, useSession } from "@/features/auth/contexts/AuthContext";
import { SocketProvider } from "@/features/iot/contexts/SocketContext";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "../../global.css";

function RootNavigator() {
  const { token } = useSession();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />

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
  useEffect(() => {
    setupNotifications();
  }, []);
  return (
    <SessionProvider>
      <SocketProvider>
        <SplashScreenController />
        <RootNavigator />
      </SocketProvider>
    </SessionProvider>
  );
}
