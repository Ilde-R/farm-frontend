import { Text, TouchableOpacity, View } from "react-native";

export default function TankCard({numero, piezas, onPress}: {numero: number, piezas: number, onPress?: () => void}) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View className="rounded-full h-40 w-40 items-center justify-center border border-cyan-700">
        <Text className="text-2xl font-bold text-cyan-700">{numero}</Text>
        <Text className="text-2xl font-bold text-cyan-700">{piezas}pz</Text>
      </View>
    </TouchableOpacity>
  );
}