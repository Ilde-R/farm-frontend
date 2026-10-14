import { ErrorBoundary } from "@/core/components/error-boundary";
import { SplashScreenController } from "@/core/components/splash-screen-controller";
import { Colors } from "@/core/constants/theme";
import { setupNotifications } from "@/core/utils/notifications";
import { SocketProvider } from "@/features/aeration/contexts/AerationSocketContext";
import { SessionProvider, useSession } from "@/features/auth/contexts/AuthContext";
import { BatchProvider } from "@/features/batches/contexts/BatchContext";
import { TankMovementProvider } from "@/features/tank-movements/contexts/TankMovementContext";
import { TankProvider } from "@/features/tanks/contexts/TankContext";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { useEffect, useMemo } from "react";
import { useColorScheme } from "react-native";
import "../../global.css";

function RootNavigator() {
  const { token } = useSession();
  const scheme = useColorScheme();
  const palette = Colors[scheme === "dark" ? "dark" : "light"];

  const navigationTheme = useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: palette.primary,
        background: palette.background,
        card: palette.backgroundElement,
        text: palette.text,
        border: palette.border,
      },
    };
  }, [scheme, palette]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(palette.background).catch(() => {});
  }, [palette.background]);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ animation: "none" }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Protected guard={!token}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!!token}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    setupNotifications();
  }, []);
  return (
    <ErrorBoundary>
      <SessionProvider>
        <SocketProvider>
          <TankProvider>
            <BatchProvider>
              <TankMovementProvider>
                <SplashScreenController />
                <RootNavigator />
              </TankMovementProvider>
            </BatchProvider>
          </TankProvider>
        </SocketProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
