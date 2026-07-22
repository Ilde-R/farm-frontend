import { Stack } from "expo-router";
import { SessionProvider, useSession } from "@/contexts/AuthContext";
import { SplashScreenController } from "@/components/splash-screen-controller";
import "../global.css";

function RootNavigator() {
  const { token } = useSession();

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
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}
