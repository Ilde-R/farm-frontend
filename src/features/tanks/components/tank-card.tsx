import { useTheme } from "@/core/theme/use-theme";
import { TANK_STATUS_CONFIG } from "@/features/tanks/constants/tank.constants";
import { TankStatus } from "@/features/tanks/types/tank";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

type Theme = ReturnType<typeof useTheme>;

type StatusPresentation = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
  badgeColor: string;
  labelColor: string;
};

function getStatusPresentation(theme: Theme): Record<string, StatusPresentation> {
  return {
    [TankStatus.ACTIVE]: {
      icon: "water",
      iconColor: theme.success,
      iconBackground: "bg-success/10",
      badgeColor: "bg-success",
      labelColor: "text-success",
    },
    [TankStatus.EMPTY]: {
      icon: "water-off",
      iconColor: theme.textTertiary,
      iconBackground: "bg-textTertiary/10",
      badgeColor: "bg-textTertiary",
      labelColor: "text-textSecondary dark:text-textSecondary-dark",
    },
    [TankStatus.MAINTENANCE]: {
      icon: "wrench-outline",
      iconColor: theme.warning,
      iconBackground: "bg-warning/10",
      badgeColor: "bg-warning",
      labelColor: "text-warning",
    },
  };
}

type TankCardProps = {
  tankNumber: number;
  tankStatus?: TankStatus | string;
  currentQuantity?: number;
  onPress?: () => void;
  size?: number;
};

export function getTankCardSize(screenWidth: number) {
  return Math.min((screenWidth - 48) / 2, 190);
}

export default function TankCard({
  tankNumber,
  tankStatus = TankStatus.ACTIVE,
  currentQuantity,
  onPress,
  size,
}: TankCardProps) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardSize = size ?? getTankCardSize(screenWidth);
  const statusPresentation =
    getStatusPresentation(theme)[tankStatus] ?? {
      icon: "help-circle-outline" as const,
      iconColor: theme.textTertiary,
      iconBackground: "bg-textTertiary/10",
      badgeColor: "bg-textTertiary",
      labelColor: "text-textSecondary dark:text-textSecondary-dark",
    };
  const displayStatus =
    TANK_STATUS_CONFIG[tankStatus as TankStatus]?.label || String(tankStatus);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Tanque ${tankNumber}, ${displayStatus}${
        currentQuantity === undefined ? "" : `, ${currentQuantity} piezas actuales`
      }`}
      className="items-center"
    >
      <View
        style={{ width: cardSize, height: cardSize }}
        className="items-center justify-center overflow-hidden rounded-full border-2 border-backgroundSelected dark:border-backgroundSelected-dark bg-backgroundElement dark:bg-backgroundElement-dark p-4 shadow-lg shadow-black/20"
      >
        <View
          className={`mb-2 h-10 w-10 items-center justify-center rounded-full ${statusPresentation.iconBackground}`}
        >
          <MaterialCommunityIcons
            name={statusPresentation.icon}
            size={20}
            color={statusPresentation.iconColor}
          />
        </View>

        <View className="items-center">
          <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-textSecondary dark:text-textSecondary-dark ">
            Tanque
          </Text>
          <Text className="text-3xl font-extrabold tracking-tight text-text dark:text-text-dark">
            {tankNumber}
          </Text>
          <View
            className={`mt-1.5 flex-row items-center gap-1.5 rounded-full px-2.5 py-1 ${statusPresentation.iconBackground}`}
          >
            <View className={`h-1.5 w-1.5 rounded-full ${statusPresentation.badgeColor}`} />
            <Text
              numberOfLines={1}
              className={`text-[10px] font-semibold ${statusPresentation.labelColor}`}
            >
              {displayStatus}
            </Text>
          </View>
          {currentQuantity !== undefined && (
            <Text className="mt-1 text-[10px] font-medium text-textSecondary dark:text-textSecondary-dark">
                {currentQuantity} piezas
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}