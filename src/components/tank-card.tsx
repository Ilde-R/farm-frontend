import { TANK_STATUS_CONFIG, type TankStatus } from "@/types/tank";
import { Text, TouchableOpacity, View } from "react-native";

type TankCardProps = {
  numero: number;
  piezas: number;
  estado?: TankStatus;
  onPress?: () => void;
};

export default function TankCard({ numero, piezas, estado = "Activo", onPress }: TankCardProps) {
  const statusColor = TANK_STATUS_CONFIG[estado].cardTextClass;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View className="rounded-full h-40 w-40 items-center justify-center border border-cyan-700">
        <Text className="text-2xl font-bold text-cyan-700">{numero}</Text>
        <Text className="text-2xl font-bold text-cyan-700">{piezas}pz</Text>
        <Text className={`font-semibold ${statusColor}`}>{estado}</Text>
      </View>
    </TouchableOpacity>
  );
}