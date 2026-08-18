import { useTheme } from "@/hooks/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
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
  const statusLabel =
    psi == null ? "Sin lectura" : isAlert ? "Bajo umbral" : "Normal";
  const statusColor =
    psi == null ? "text-gray-300" : isAlert ? "text-red-300" : "text-emerald-300";
  const badgeColor =
    psi == null ? "bg-slate-500" : isAlert ? "bg-red-500" : "bg-emerald-500";
  const pillColor =
    psi == null ? "bg-slate-600/60" : isAlert ? "bg-red-500/15" : "bg-emerald-500/15";
  const trendValues = [
    Math.max(0.2, (psi ?? threshold) - 0.8),
    Math.max(0.2, (psi ?? threshold) - 0.4),
    Math.max(0.2, psi ?? threshold),
    Math.max(0.2, (psi ?? threshold) + 0.2),
    Math.max(0.2, (psi ?? threshold) - 0.2),
    Math.max(0.2, psi ?? threshold),
  ];
  const chartColor = isAlert ? "#f87171" : "#34d399";
  const chartMax = Math.max(...trendValues, threshold + 1, 2.5);
  const chartMin = Math.min(...trendValues, 0, threshold - 0.5);
  const thresholdY = 70 - ((threshold - chartMin) / (chartMax - chartMin || 1)) * 56;

  const chartPath = trendValues
    .map((value, index) => {
      const x = (index / (trendValues.length - 1)) * 110;
      const y = 70 - ((value - chartMin) / (chartMax - chartMin || 1)) * 56;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

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
    <View className="bg-[#313b59] rounded-3xl w-full overflow-hidden mb-6 border border-white/10 shadow-xl shadow-black/20">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
        <View className="flex-row items-center gap-2">
          <View className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-red-400"}`} />
          <Text className="text-text dark:text-text-dark text-sm font-semibold">
            {name}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => setSelectingSave(true)}>
            <MaterialCommunityIcons
              name="cog-outline"
              size={18}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
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
              size={18}
              color="#FF6B5F"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row items-center px-4 pb-4">
        <View className="flex-1">
          <Text className="text-gray-400 text-[10px] uppercase tracking-[1.5px] mb-1">
            Presión actual
          </Text>
          <Text className="text-white text-4xl font-extrabold tracking-tight">
            {psi != null ? Number(psi).toFixed(2) : "--.--"}
          </Text>
          <View className={`mt-3 self-start rounded-full px-2 py-1 ${pillColor}`}>
            <View className="flex-row items-center gap-2">
              <View className={`h-2 w-2 rounded-full ${badgeColor}`} />
              <Text className={`${statusColor} text-[10px] font-semibold uppercase tracking-[1.2px]`}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>

        <View className="ml-3 h-24 w-[1px] bg-white/15" />

        <View className="flex-1 pl-4">
          <Text className="text-gray-400 text-[10px] uppercase tracking-[1.5px] mb-2">
            Tendencia
          </Text>

          <View className="rounded-2xl bg-[#1b2338] p-2 border border-white/5">
            <Svg width={120} height={78} viewBox="0 0 120 78">
              <Path
                d={`${chartPath} L 110 78 L 0 78 Z`}
                fill={chartColor}
                opacity={0.12}
              />
              <Path
                d={`M 0 ${thresholdY} L 110 ${thresholdY}`}
                stroke="#f8fafc"
                strokeDasharray="4 4"
                opacity={0.5}
              />
              <Path d={chartPath} stroke={chartColor} strokeWidth={2.2} fill="none" />
            </Svg>
          </View>

          <View className="mt-2 rounded-2xl bg-white/5 px-3 py-2">
            <Text className="text-gray-300 text-[10px] uppercase tracking-[1.2px]">
              Umbral
            </Text>
            <Text className="text-emerald-300 font-semibold mt-1">
              {threshold.toFixed(1)} PSI
            </Text>
          </View>
        </View>
      </View>

      <View className="border-t border-white/10 bg-black/10 px-4 py-3 flex-row items-center justify-between">
        <Text className="text-gray-300 text-[10px] uppercase tracking-[1.3px]">
          {firmwareVersion ? `FW ${firmwareVersion}` : "Sensor activo"}
        </Text>
        <Text className="text-gray-300 text-[10px] uppercase tracking-[1.3px]">
          {isOnline ? "Online" : "Offline"}
        </Text>
      </View>

      <SaveIntervalPicker
        name={name}
        visible={selectingSave}
        currentValue={saveIntervalSeconds ?? 1800}
        threshold={threshold}
        onSelect={(value) => onSaveConfig?.(blowerId, value)}
        onSetThreshold={(value) => onSetThreshold(blowerId, value)}
        onClose={() => setSelectingSave(false)}
      />
    </View>
  );
}
