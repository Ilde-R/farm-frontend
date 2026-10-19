import { ErrorBoundary } from "@/core/components/error-boundary";
import { SplashScreenController } from "@/core/components/splash-screen-controller";
import { ToastProvider } from "@/core/components/ui/toast";
import { Colors } from "@/core/constants/theme";
import { setupNotifications } from "@/core/utils/notifications";
import { SocketProvider } from "@/features/aeration/contexts/AerationSocketContext";
import { SessionProvider, useSession } from "@/features/auth/contexts/AuthContext";
import { BatchProvider } from "@/features/batches/contexts/BatchContext";
import { TankMovementProvider } from "@/features/tank-movements/contexts/TankMovementContext";
import { TankProvider } from "@/features/tanks/contexts/TankContext";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts,
} from "@expo-google-fonts/inter";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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
      <Stack screenOptions={{ animation: "fade" }}>
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
  const [fontsLoaded, fontError] = useFonts({
    // Preload the icon font so first paint never shows invisible icons.
    ...MaterialCommunityIcons.font,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    setupNotifications();
  }, []);

  if (!fontsReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SessionProvider>
        <SocketProvider>
          <TankProvider>
            <BatchProvider>
              <TankMovementProvider>
                <SplashScreenController fontsReady={fontsReady} />
                <ToastProvider>
                  <RootNavigator />
                </ToastProvider>
              </TankMovementProvider>
            </BatchProvider>
          </TankProvider>
        </SocketProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
