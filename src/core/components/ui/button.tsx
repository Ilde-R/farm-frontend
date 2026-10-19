import { cn } from "@/core/utils/cn";
import { useTheme } from "@/core/theme/use-theme";
import * as Haptics from "expo-haptics";
import { ReactNode } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

export type ButtonVariant = "primary" | "secondary" | "danger" | "dangerOutline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<TouchableOpacityProps, "className"> {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  /** Leading icon node (e.g. <MaterialCommunityIcons … />). */
  icon?: ReactNode;
  className?: string;
  /** Fire a light haptic tick on press. Defaults to true. */
  haptic?: boolean;
}

const CONTAINER_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "border border-border bg-backgroundElement dark:bg-backgroundElement-dark",
  danger: "bg-danger",
  dangerOutline: "border border-danger dark:border-danger-dark",
  ghost: "bg-transparent",
};

const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: "text-primaryForeground",
  secondary: "text-text dark:text-text-dark",
  danger: "text-primaryForeground",
  dangerOutline: "text-danger dark:text-danger-dark",
  ghost: "text-primary dark:text-primary-dark",
};

const SIZE_CLASSES: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: "px-4 py-2", text: "text-sm" },
  md: { container: "px-5 py-3", text: "text-base" },
  lg: { container: "px-6 py-4", text: "text-lg" },
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  className,
  haptic = true,
  ...touchableProps
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const spinnerColor =
    variant === "primary" || variant === "danger"
      ? theme.primaryForeground
      : variant === "dangerOutline"
        ? theme.danger
        : theme.text;

  function handlePress() {
    if (isDisabled) return;
    if (haptic && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center rounded-lg",
        CONTAINER_CLASSES[variant],
        SIZE_CLASSES[size].container,
        isDisabled && "opacity-50",
        className,
      )}
      {...touchableProps}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <>
          {icon}
          <Text
            className={cn(
              "font-semibold",
              TEXT_CLASSES[variant],
              SIZE_CLASSES[size].text,
              icon ? "ml-2" : undefined,
            )}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
