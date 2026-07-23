import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-device" />
      </Stack>
    </>
  );
}
