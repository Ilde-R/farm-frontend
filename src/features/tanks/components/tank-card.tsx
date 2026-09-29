import { TANK_STATUS_CONFIG } from "@/features/tanks/constants/tank.constants";
import { TankStatus } from "@/features/tanks/types/tank";
import { Text, TouchableOpacity, View } from "react-native";

type TankCardProps = {
  tankNumber: number;
  tankStatus?: TankStatus | string;
  onPress?: () => void;
};

export default function TankCard({
  tankNumber,
  tankStatus = TankStatus.ACTIVE,
  onPress,
}: TankCardProps) {
  const displayStatus =
    TANK_STATUS_CONFIG[tankStatus as TankStatus]?.label || String(tankStatus);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} className="m-1.5">
      <View className="w-40 h-40 rounded-full bg-[#313b59] border-2 border-cyan-700/80 items-center justify-center shadow-md shadow-black/20">
        <Text className="text-text text-3xl font-extrabold">
          {tankNumber}
        </Text>

        <Text className="text-gray-300 text-xs font-medium uppercase tracking-wider mt-1">
          {displayStatus}
        </Text>
        <Text className="text-text dark:t">
          100pz
        </Text>
      </View>
    </TouchableOpacity>
  );
}