import { TANK_STATUS_CONFIG } from "@/features/tanks/constants/tank.constants";
import { TankStatus } from "@/features/tanks/types/tank";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

const STATUS_PRESENTATION: Record<
  string,
  {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor: string;
    iconBackground: string;
    badgeColor: string;
    labelColor: string;
  }
> = {
  [TankStatus.ACTIVE]: {
    icon: "water",
    iconColor: "#6ee7b7",
    iconBackground: "bg-emerald-400/10",
    badgeColor: "bg-emerald-400",
    labelColor: "text-emerald-200",
  },
  [TankStatus.EMPTY]: {
    icon: "water-off",
    iconColor: "#cbd5e1",
    iconBackground: "bg-slate-400/10",
    badgeColor: "bg-slate-400",
    labelColor: "text-slate-200",
  },
  [TankStatus.MAINTENANCE]: {
    icon: "wrench-outline",
    iconColor: "#fcd34d",
    iconBackground: "bg-amber-400/10",
    badgeColor: "bg-amber-400",
    labelColor: "text-amber-200",
  },
};

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
  const { width: screenWidth } = useWindowDimensions();
  const cardSize = size ?? getTankCardSize(screenWidth);
  const statusPresentation =
    STATUS_PRESENTATION[tankStatus] ?? {
      icon: "help-circle-outline" as const,
      iconColor: "#cbd5e1",
      iconBackground: "bg-slate-400/10",
      badgeColor: "bg-slate-400",
      labelColor: "text-slate-200",
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
        className="items-center justify-center overflow-hidden rounded-full border-2 border-white/10 bg-[#29334d] p-4 shadow-lg shadow-black/20"
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
          <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-slate-400">
            Tanque
          </Text>
          <Text className="text-3xl font-extrabold tracking-tight text-white">
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
            <Text className="mt-1 text-[10px] font-medium text-slate-300">
                {currentQuantity} piezas
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}