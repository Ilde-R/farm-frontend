import StatusPill, { type StatusPillTone } from "@/core/components/ui/status-pill";
import { useTheme } from "@/core/theme/use-theme";
import { TANK_STATUS_CONFIG } from "@/features/tanks/constants/tank.constants";
import { TankStatus } from "@/features/tanks/types/tank";
import { getDaysInCulture } from "@/features/tanks/utils/tank-list";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

type Theme = ReturnType<typeof useTheme>;

type StatusPresentation = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
};

const STATUS_TONES: Record<TankStatus, StatusPillTone> = {
  [TankStatus.ACTIVE]: "success",
  [TankStatus.EMPTY]: "neutral",
  [TankStatus.MAINTENANCE]: "warning",
};

function getStatusPresentation(theme: Theme): Record<string, StatusPresentation> {
  return {
    [TankStatus.ACTIVE]: {
      icon: "water",
      iconColor: theme.success,
      iconBackground: "bg-success/10",
    },
    [TankStatus.EMPTY]: {
      icon: "water-off",
      iconColor: theme.textTertiary,
      iconBackground: "bg-textTertiary/10",
    },
    [TankStatus.MAINTENANCE]: {
      icon: "wrench-outline",
      iconColor: theme.warning,
      iconBackground: "bg-warning/10",
    },
  };
}

type TankCardProps = {
  tankNumber: number;
  tankStatus?: TankStatus | string;
  currentQuantity?: number;
  stockingDate?: string;
  onPress?: () => void;
  size?: number;
  highlighted?: boolean;
  /**
   * `rectangle` (default) for list grids, `circle` for the transfer map where
   * flow lines anchor to the card's circular border.
   */
  shape?: "rectangle" | "circle";
};

/** Card width for a 2-column grid. Content is capped at `max-w-3xl` (768) minus `px-4`. */
export function getTankCardSize(screenWidth: number) {
  const contentWidth = Math.min(screenWidth, 768) - 32;
  return Math.min(contentWidth / 2 - 16, 190);
}

export default function TankCard({
  tankNumber,
  tankStatus = TankStatus.ACTIVE,
  currentQuantity,
  stockingDate,
  onPress,
  size,
  highlighted = false,
  shape = "rectangle",
}: TankCardProps) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardSize = size ?? getTankCardSize(screenWidth);
  const daysInCulture = getDaysInCulture(stockingDate);
  const statusPresentation =
    getStatusPresentation(theme)[tankStatus] ?? {
      icon: "help-circle-outline" as const,
      iconColor: theme.textTertiary,
      iconBackground: "bg-textTertiary/10",
    };
  const displayStatus =
    TANK_STATUS_CONFIG[tankStatus as TankStatus]?.label || String(tankStatus);
  const borderClass = highlighted
    ? "border-primary dark:border-primary-dark"
    : "border-border dark:border-border-dark";

  if (shape === "circle") {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Tanque ${tankNumber}, ${displayStatus}${
          currentQuantity === undefined ? "" : `, ${currentQuantity} piezas actuales`
        }${daysInCulture === null ? "" : `, ${daysInCulture} días de cultivo`}`}
        style={{ width: cardSize, height: cardSize }}
        className={`items-center justify-center overflow-hidden rounded-full border-2 bg-backgroundElement dark:bg-backgroundElement-dark ${borderClass}`}
      >
        <View
          className={`h-9 w-9 items-center justify-center rounded-full ${statusPresentation.iconBackground}`}
        >
          <MaterialCommunityIcons
            name={statusPresentation.icon}
            size={18}
            color={statusPresentation.iconColor}
          />
        </View>
        <Text className="mt-1.5 text-3xl font-extrabold tracking-tight text-text dark:text-text-dark">
          {tankNumber}
        </Text>
        <StatusPill
          label={displayStatus}
          tone={STATUS_TONES[tankStatus as TankStatus] ?? "neutral"}
          className="mt-2"
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Tanque ${tankNumber}, ${displayStatus}${
        currentQuantity === undefined ? "" : `, ${currentQuantity} piezas actuales`
      }${daysInCulture === null ? "" : `, ${daysInCulture} días de cultivo`}`}
      style={{ width: cardSize }}
      className={`overflow-hidden rounded-2xl border bg-backgroundElement p-4 dark:bg-backgroundElement-dark ${borderClass}`}
    >
      <View className="flex-row items-center justify-between">
        <View
          className={`h-9 w-9 items-center justify-center rounded-xl ${statusPresentation.iconBackground}`}
        >
          <MaterialCommunityIcons
            name={statusPresentation.icon}
            size={18}
            color={statusPresentation.iconColor}
          />
        </View>
        <StatusPill
          label={displayStatus}
          tone={STATUS_TONES[tankStatus as TankStatus] ?? "neutral"}
        />
      </View>

      <Text className="mt-4 text-4xl font-extrabold tracking-tight text-text dark:text-text-dark">
        {tankNumber}
      </Text>

      <View className="mt-3 gap-1.5 border-t border-border pt-3 dark:border-border-dark">
        {currentQuantity !== undefined && (
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-textSecondary dark:text-textSecondary-dark">
              Piezas
            </Text>
            <Text className="text-xs font-semibold text-text dark:text-text-dark">
              {currentQuantity.toLocaleString("es-MX")}
            </Text>
          </View>
        )}
        {daysInCulture !== null && (
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-textSecondary dark:text-textSecondary-dark">
              Cultivo
            </Text>
            <Text className="text-xs font-semibold text-text dark:text-text-dark">
              {daysInCulture} {daysInCulture === 1 ? "día" : "días"}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}