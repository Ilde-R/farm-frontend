import { SplashScreenController } from "@/components/splash-screen-controller";
import { SessionProvider, useSession } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { setupNotifications } from "@/utils/notifications";
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
