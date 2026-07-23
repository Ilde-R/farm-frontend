import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

interface BlowerCardProps {
  blowerId: string;
  name: string;
  psi: number | null;
  threshold: number;
  isOnline: boolean;
  onSetThreshold: (blowerId: string, threshold: number) => void;
}

export default function BlowerCard({
  blowerId,
  name,
  psi,
  threshold,
  isOnline,
  onSetThreshold,
}: BlowerCardProps) {
  const [editing, setEditing] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(threshold.toString());

  useEffect(() => {
    if (!editing) setThresholdInput(threshold.toString());
  }, [threshold, editing]);

  const isAlert = psi !== null && psi <= threshold;

  function handleSave() {
    const value = parseFloat(thresholdInput);
    if (isNaN(value) || value < 0) {
      Alert.alert("Error", "Ingresa un número válido");
      return;
    }
    onSetThreshold(blowerId, value);
    setEditing(false);
  }

  return (
    <View className="bg-backgroundElement rounded-xl p-5 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <View
            className="rounded-full"
            style={{
              width: 8,
              height: 8,
              backgroundColor: isOnline
                ? "#22c55e"
                : Colors.light.textSecondary,
            }}
          />
          <View>
            <Text className="text-text font-bold text-lg">{name}</Text>
            <Text className="text-textSecondary text-xs">{blowerId}</Text>
          </View>
        </View>
        {isAlert && (
          <View className="flex-row items-center bg-backgroundSelected rounded-full px-3 py-1">
            <MaterialCommunityIcons
              name="alert"
              size={14}
              color={Colors.light.textSecondary}
            />
            <Text className="text-textSecondary text-xs ml-1">Alerta</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-baseline mb-4">
        <Text className="text-text font-bold" style={{ fontSize: 48 }}>
          {psi !== null ? psi.toFixed(1) : "--"}
        </Text>
        <Text className="text-textSecondary text-lg ml-1">PSI</Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-textSecondary text-sm">
          Umbral: {editing ? "" : `${threshold} PSI`}
        </Text>

        {editing ? (
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <TextInput
              className="bg-background border border-backgroundSelected rounded-lg px-3 py-1 text-text text-sm"
              style={{ width: 60 }}
              value={thresholdInput}
              onChangeText={setThresholdInput}
              keyboardType="numeric"
              autoFocus
            />
            <TouchableOpacity onPress={handleSave}>
              <Text className="text-text font-semibold text-sm">OK</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditing(false)}>
              <Text className="text-textSecondary text-sm">Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text className="text-textSecondary text-sm underline">Editar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
