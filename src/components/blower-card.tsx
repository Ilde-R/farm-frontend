import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SAVE_INTERVAL_OPTIONS = [
  { value: 1800, label: "30 minutos" },
  { value: 3600, label: "1 hora" },
  { value: 7200, label: "2 horas" },
  { value: 10800, label: "3 horas" },
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

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
  const [editing, setEditing] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(threshold.toString());
  const [editingConfig, setEditingConfig] = useState(false);
  const [intervalInput, setIntervalInput] = useState(
    ((readIntervalMs ?? 1000) / 1000).toString(),
  );
  const [selectingSave, setSelectingSave] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    if (!editing) setThresholdInput(threshold.toString());
  }, [threshold, editing]);

  useEffect(() => {
    if (!editingConfig)
      setIntervalInput(((readIntervalMs ?? 1000) / 1000).toString());
  }, [readIntervalMs, editingConfig]);

  useEffect(() => {
    if (!selectingSave) setCustomMode(false);
  }, [selectingSave]);

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

  function handleSelectSaveInterval(value: number) {
    onSaveConfig?.(blowerId, value);
    setSelectingSave(false);
  }

  function handleCustomSave() {
    const seconds = parseInt(customInput, 10);
    if (isNaN(seconds) || seconds < 600 || seconds > 10800) {
      Alert.alert("Error", "El intervalo debe estar entre 10 minutos y 3 horas");
      return;
    }
    onSaveConfig?.(blowerId, seconds);
    setSelectingSave(false);
    setCustomMode(false);
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
                  {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => onDelete(blowerId),
                  },
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
        <>
          <View className="flex-row items-center justify-between">
            <Text className="text-textSecondary text-sm">
              Intervalo:{" "}
              {editingConfig
                ? ""
                : `${((readIntervalMs ?? 1000) / 1000).toFixed(1)}s`}
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
                <Text className="text-textSecondary text-sm underline">
                  Config
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-textSecondary text-sm">
              Intervalo de guardado: {formatDuration(saveIntervalSeconds ?? 60)}
            </Text>

            <TouchableOpacity onPress={() => { setSelectingSave(true); setCustomInput(""); }}>
              <Text className="text-textSecondary text-sm underline">
                Cambiar
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal
        visible={selectingSave}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectingSave(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setSelectingSave(false)}
        >
          <Pressable className="bg-backgroundElement rounded-t-2xl pt-6 pb-10 px-6">
            <Text className="text-text font-bold text-lg mb-4 text-center">
              Intervalo de guardado
            </Text>

            {customMode ? (
              <View>
                <TextInput
                  className="bg-background border border-backgroundSelected rounded-lg px-4 py-3 text-text text-base mb-4"
                  placeholder="Segundos (600-10800)"
                  value={customInput}
                  onChangeText={setCustomInput}
                  keyboardType="numeric"
                  autoFocus
                />
                <View className="flex-row justify-end" style={{ gap: 12 }}>
                  <TouchableOpacity
                    className="rounded-lg px-4 py-2"
                    onPress={() => setCustomMode(false)}
                  >
                    <Text className="text-textSecondary text-base">Volver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-text rounded-lg px-6 py-2"
                    onPress={handleCustomSave}
                  >
                    <Text className="text-background font-semibold text-base">
                      OK
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                {SAVE_INTERVAL_OPTIONS.map((opt) => {
                  const isSelected = (saveIntervalSeconds ?? 60) === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      className={`rounded-lg px-4 py-3 mb-1 ${isSelected ? "bg-backgroundSelected" : ""}`}
                      onPress={() => handleSelectSaveInterval(opt.value)}
                    >
                      <Text
                        className={`text-base ${isSelected ? "text-text font-semibold" : "text-textSecondary"}`}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <View className="border-t border-backgroundSelected mt-2 pt-2">
                  <TouchableOpacity
                    className="rounded-lg px-4 py-3"
                    onPress={() => setCustomMode(true)}
                  >
                    <Text className="text-text text-base">Personalizado...</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
