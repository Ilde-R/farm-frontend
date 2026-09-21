import { TANK_STATUS_CONFIG } from "@/features/tanks/constants/tank.constants"; // Ajusta esta ruta según donde creaste el archivo
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
  
  const displayStatus = TANK_STATUS_CONFIG[tankStatus as TankStatus]?.label || tankStatus;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View className="items-center justify-center w-40 h-40 border rounded-full border-cyan-700">
        <Text className="text-2xl font-bold text-cyan-700">
          {tankNumber}
        </Text>
        
        <Text className="font-semibold text-cyan-700">
          {displayStatus}
        </Text>
      </View>
    </TouchableOpacity>
  );
}