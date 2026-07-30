import { useTheme } from "@/hooks/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import SaveIntervalPicker from "./ui/save-interval-picker";

interface BlowerCardProps {
  blowerId: string;
  name: string;
  psi: number | null;
  threshold: number;
  isOnline: boolean;
  firmwareVersion?: string;
  readIntervalMs?: number;
  saveIntervalSeconds?: number;
  onSetThreshold: (blowerId: string, threshold: number) => void;
  onSetDeviceConfig?: (
    blowerId: string,
    config: { readIntervalMs?: number },
  ) => void;
  onDelete?: (blowerId: string) => void;
  onSaveConfig?: (blowerId: string, saveIntervalSeconds: number) => void;
}

export default function BlowerCard({
  blowerId,
  name,
  psi,
  threshold,
  isOnline,
  firmwareVersion,
  readIntervalMs,
  saveIntervalSeconds,
  onSetThreshold,
  onSetDeviceConfig,
  onSaveConfig,
  onDelete,
}: BlowerCardProps) {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(threshold.toString());
  const [editingConfig, setEditingConfig] = useState(false);
  const [intervalInput, setIntervalInput] = useState(
    ((readIntervalMs ?? 1000) / 1000).toString(),
  );
  const [selectingSave, setSelectingSave] = useState(false);

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
    onSetDeviceConfig?.(blowerId, {
      readIntervalMs: Math.round(seconds * 1000),
    });
    setEditingConfig(false);
  }

  return (
    <View className="bg-[#313b59] rounded-3xl w-full flex-row relative overflow-hidden h-40 mb-6">
      <View className="flex-1 p-3 justify-between ">
        {/* Izquierda */}
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => setSelectingSave(true)}>
            <MaterialCommunityIcons
              name="cog-outline"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
          <Text className="text-text dark:text-text-dark text-xs">{name}</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Eliminar blower",
                `¿Eliminar "${name}" (${blowerId})?`,
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => onDelete?.(blowerId),
                  },
                ],
              );
            }}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={"#FF2B00"}
            />
          </TouchableOpacity>
        </View>
        {/* PSI */}
        <Text className="text-white text-4xl font-extrabold text-center tracking-tight">
          {psi != null ? Number(psi).toFixed(2) : "--.--"}
        </Text>
        {/* Alto y Bajo */}
        <View className="flex-row justify-center items-center mt-2 space-x-6">
          <View className="items-center">
            <Text className="text-white">Alto</Text>
            <Text className="text-green-600">330.00</Text>
          </View>

          <View className="w-[2px] h-10 bg-gray-400 opacity-50 mx-4" />

          <View className="items-center">
            <Text className="text-white">Bajo</Text>
            <Text className="text-red-600">00.00</Text>
          </View>
        </View>
      </View>

      {/* Primer intento fallido ;( */}
      {/* Circulo arriba */}
      {/* <View className="absolute top-[-25px] left-1/2 w-20 h-20 rounded-full bg-[#ffff] -ml-6 z-10" /> */}
      {/* Circulo abajo */}
      {/* <View className="absolute bottom-[-25px] left-1/2 w-20 h-20 rounded-full bg-[#ffff] -ml-6 z-10" /> */}

      <View className="absolute inset-y-0 left-1/2 w-0.5 bg-white" />

      {/* Grafica */}
      <View className="flex-1 p-4 justify-center items-center relative z -0">
        <View className="absolute top-3 right-3">
          <View
            className={`h-4 w-4 rounded-full ${
              isOnline ? "bg-green-400" : "bg-red-400"
            }`}
          />
        </View>
        <View className=" w-full h-full flex items-center justify-center">
          <Text className="text-gray-400 text-xs text-center">
            Libreria de grafica
          </Text>
        </View>
      </View>

      <SaveIntervalPicker
        name={name}
        visible={selectingSave}
        currentValue={saveIntervalSeconds ?? 1800}
        onSelect={(value) => onSaveConfig?.(blowerId, value)}
        onClose={() => setSelectingSave(false)}
      />
    </View>
  );
}
