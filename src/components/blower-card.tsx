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
  firmwareVersion?: string;
  readIntervalMs?: number;
  onSetThreshold: (blowerId: string, threshold: number) => void;
  onSetDeviceConfig?: (blowerId: string, config: { readIntervalMs?: number }) => void;
  onDelete?: (blowerId: string) => void;
}

export default function BlowerCard({
  blowerId,
  name,
  psi,
  threshold,
  isOnline,
  firmwareVersion,
  readIntervalMs,
  onSetThreshold,
  onSetDeviceConfig,
  onDelete,
}: BlowerCardProps) {
  const [editing, setEditing] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(threshold.toString());
  const [editingConfig, setEditingConfig] = useState(false);
  const [intervalInput, setIntervalInput] = useState(
    ((readIntervalMs ?? 1000) / 1000).toString(),
  );

  useEffect(() => {
    if (!editing) setThresholdInput(threshold.toString());
  }, [threshold, editing]);

  useEffect(() => {
    if (!editingConfig)
      setIntervalInput(((readIntervalMs ?? 1000) / 1000).toString());
  }, [readIntervalMs, editingConfig]);

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

  function handleSaveConfig() {
    const seconds = parseFloat(intervalInput);
    if (isNaN(seconds) || seconds < 0.5 || seconds > 60) {
      Alert.alert("Error", "Intervalo debe ser entre 0.5 y 60 segundos");
      return;
    }
    onSetDeviceConfig?.(blowerId, { readIntervalMs: Math.round(seconds * 1000) });
    setEditingConfig(false);
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
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Text className="text-textSecondary text-xs">{blowerId}</Text>
              {firmwareVersion && (
                <Text className="text-textSecondary text-xs">
                  · v{firmwareVersion}
                </Text>
              )}
            </View>
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
        {onDelete && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Eliminar blower",
                `¿Eliminar "${name}" (${blowerId})? Se borrarán el dispositivo y sus claves.`,
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Eliminar", style: "destructive", onPress: () => onDelete(blowerId) },
                ],
              );
            }}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row items-baseline mb-4">
        <Text className="text-text font-bold" style={{ fontSize: 48 }}>
          {psi !== null ? psi.toFixed(1) : "--"}
        </Text>
        <Text className="text-textSecondary text-lg ml-1">PSI</Text>
      </View>

      <View className="flex-row items-center justify-between mb-2">
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

      {isOnline && (
        <View className="flex-row items-center justify-between">
          <Text className="text-textSecondary text-sm">
            Intervalo: {editingConfig ? "" : `${((readIntervalMs ?? 1000) / 1000).toFixed(1)}s`}
          </Text>

          {editingConfig ? (
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <TextInput
                className="bg-background border border-backgroundSelected rounded-lg px-3 py-1 text-text text-sm"
                style={{ width: 60 }}
                value={intervalInput}
                onChangeText={setIntervalInput}
                keyboardType="numeric"
                autoFocus
              />
              <TouchableOpacity onPress={handleSaveConfig}>
                <Text className="text-text font-semibold text-sm">OK</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingConfig(false)}>
                <Text className="text-textSecondary text-sm">Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingConfig(true)}>
              <Text className="text-textSecondary text-sm underline">Config</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
