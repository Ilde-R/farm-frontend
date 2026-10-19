import { cn } from "@/core/utils/cn";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  className?: string;
}

/** Standard surface: white (or dark) card with hairline border. */
export default function Card({ className, ...viewProps }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-2xl border border-border bg-backgroundElement p-4 dark:bg-backgroundElement-dark",
        className,
      )}
      {...viewProps}
    />
  );
}
