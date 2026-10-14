import { AnimatedSplashOverlay } from "@/core/components/animated-icon";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="aerations/add-aeration" />
      </Stack>
    </>
  );
}
