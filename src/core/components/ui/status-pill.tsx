import { cn } from "@/core/utils/cn";
import { View, Text } from "react-native";

export type StatusPillTone = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusPillProps {
  label: string;
  tone: StatusPillTone;
  className?: string;
}

/** Full class strings so Tailwind can statically extract them. */
const TONE_CLASSES: Record<StatusPillTone, { container: string; dot: string; text: string }> = {
  success: {
    container: "bg-success/10",
    dot: "bg-success",
    text: "text-success dark:text-success-dark",
  },
  warning: {
    container: "bg-warning/10",
    dot: "bg-warning",
    text: "text-warning dark:text-warning-dark",
  },
  danger: {
    container: "bg-danger/10",
    dot: "bg-danger",
    text: "text-danger dark:text-danger-dark",
  },
  info: {
    container: "bg-info/10",
    dot: "bg-info",
    text: "text-info dark:text-info-dark",
  },
  neutral: {
    container: "bg-backgroundSelected dark:bg-backgroundSelected-dark",
    dot: "bg-textSecondary dark:bg-textSecondary-dark",
    text: "text-textSecondary dark:text-textSecondary-dark",
  },
};

export default function StatusPill({ label, tone, className }: StatusPillProps) {
  const classes = TONE_CLASSES[tone];

  return (
    <View
      className={cn(
        "flex-row items-center gap-1.5 rounded-full px-2.5 py-1",
        classes.container,
        className,
      )}
    >
      <View className={cn("h-1.5 w-1.5 rounded-full", classes.dot)} />
      <Text className={cn("text-xs font-semibold", classes.text)}>{label}</Text>
    </View>
  );
}
