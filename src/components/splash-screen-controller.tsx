import { SplashScreen } from "expo-router";
import { useSession } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useSession();
  console.log(`[BOOT] SplashScreenController isLoading=${isLoading}`);

  if (!isLoading) {
    console.log("[BOOT] Hiding splash screen");
    SplashScreen.hide();
  }

  return null;
}
