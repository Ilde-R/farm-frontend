import Button from "@/core/components/ui/button";
import { useTheme } from "@/core/theme/use-theme";
import { cn } from "@/core/utils/cn";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text, View } from "react-native";

interface EmptyStateProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View className={cn("items-center px-6 py-12", className)}>
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-backgroundSelected dark:bg-backgroundSelected-dark">
        <MaterialCommunityIcons name={icon} size={28} color={theme.textTertiary} />
      </View>

      <Text className="text-base font-semibold text-text dark:text-text-dark">
        {title}
      </Text>

      {description ? (
        <Text className="mt-1.5 text-center text-sm leading-5 text-textSecondary dark:text-textSecondary-dark">
          {description}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="sm"
          className="mt-5"
        />
      ) : null}
    </View>
  );
}
