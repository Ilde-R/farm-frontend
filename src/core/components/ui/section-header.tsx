import { cn } from "@/core/utils/cn";
import { ReactNode } from "react";
import { Text, View } from "react-native";

interface SectionHeaderProps {
  /** Small uppercase label above the title. */
  eyebrow?: string;
  title: string;
  /** Element rendered on the right side (e.g. a "Ver todo" link). */
  action?: ReactNode;
  className?: string;
}

/** Consistent section heading: optional eyebrow + title (+ right action). */
export default function SectionHeader({
  eyebrow,
  title,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <View className={cn("mb-3", className)}>
      {eyebrow ? (
        <Text className="mb-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-textSecondary dark:text-textSecondary-dark">
          {eyebrow}
        </Text>
      ) : null}

      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-text dark:text-text-dark">
          {title}
        </Text>
        {action}
      </View>
    </View>
  );
}
