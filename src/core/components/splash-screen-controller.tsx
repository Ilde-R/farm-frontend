import { useSession } from "@/features/auth/contexts/AuthContext";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";

SplashScreen.preventAutoHideAsync();

interface SplashScreenControllerProps {
  /** False while fonts (or anything else blocking) are still loading. */
  fontsReady?: boolean;
}

export function SplashScreenController({ fontsReady = true }: SplashScreenControllerProps) {
  const { isLoading } = useSession();
  const hasHidden = useRef(false);

  // Safety timeout: force hide splash after 5 seconds if something goes wrong
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasHidden.current) {
        hasHidden.current = true;
        SplashScreen.hideAsync().catch(() => {});
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isLoading && fontsReady && !hasHidden.current) {
      hasHidden.current = true;
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading, fontsReady]);

  return null;
}
