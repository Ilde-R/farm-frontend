import { useTheme } from "@/core/theme/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  message: string;
  type?: ToastType;
}

interface ToastContextValue {
  show: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

const TYPE_ICONS: Record<ToastType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  success: "check-circle",
  error: "alert-circle",
  info: "information",
};

const AUTO_DISMISS_MS = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((options: ToastOptions) => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setToast({ ...options, id: Date.now() });
    dismissTimer.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  const type = toast?.type ?? "info";
  const iconColor =
    type === "success" ? theme.success : type === "error" ? theme.danger : theme.info;

  return (
    <ToastContext.Provider value={{ show }}>
      <View className="flex-1">{children}</View>

      {toast && (
        <Animated.View
          key={toast.id}
          entering={FadeInDown.springify().damping(18)}
          exiting={FadeOutDown.duration(200)}
          pointerEvents="none"
          className="absolute left-4 right-4 flex-row items-center gap-3 rounded-2xl border border-border bg-backgroundElement px-4 py-3 shadow-lg dark:bg-backgroundElement-dark"
          style={{ bottom: insets.bottom + 90 }}
        >
          <MaterialCommunityIcons name={TYPE_ICONS[type]} size={22} color={iconColor} />
          <Text className="flex-1 text-sm font-medium text-text dark:text-text-dark">
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}
