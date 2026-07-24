import * as SplashScreen from "expo-splash-screen";
import { useSession } from "@/contexts/AuthContext";
import { useEffect, useRef } from "react";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
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
    if (!isLoading && !hasHidden.current) {
      hasHidden.current = true;
      SplashScreen.hideAsync().catch((e) => {
      });
    }
  }, [isLoading]);

  return null;
}
