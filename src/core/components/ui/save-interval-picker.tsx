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
import ThresholdSlider from "./threshold-slider";

const SAVE_INTERVAL_OPTIONS = [
  { value: 1800, label: "30 min" },
  { value: 3600, label: "1 hora" },
  { value: 7200, label: "2 horas" },
  { value: 10800, label: "3 horas" },
];

interface SaveIntervalPickerProps {
  name: string;
  threshold: number;
  visible: boolean;
  currentValue: number;
  onSelect: (value: number) => void;
  onSetThreshold?: (threshold: number) => void;
  onClose: () => void;
}

export default function SaveIntervalPicker({
  name,
  threshold,
  visible,
  currentValue,
  onSelect,
  onSetThreshold,
  onClose,
}: SaveIntervalPickerProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [editingThreshold, setEditingThreshold] = useState(threshold);

  // Sync the local editing value whenever the modal opens or the prop changes
  useEffect(() => {
    if (visible) {
      setEditingThreshold(threshold);
    }
  }, [visible, threshold]);

  function handleSelect(value: number) {
    onSelect(value);
    onClose();
  }

  function handleCustomSave() {
    const seconds = parseInt(customInput, 10);
    if (isNaN(seconds) || seconds < 600 || seconds > 10800) {
      Alert.alert(
        "Error",
        "El intervalo debe estar entre 10 minutos y 3 horas",
      );
      return;
    }
    onSelect(seconds);
    setCustomMode(false);
    onClose();
  }

  function handleClose() {
    setCustomMode(false);
    setCustomInput("");
    onClose();
  }

  function handleThresholdComplete(value: number) {
    onSetThreshold?.(value);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/40">
        <Pressable className="flex-1" onPress={handleClose} />
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-[#313b59] rounded-t-2xl pt-6 pb-10 px-6 overflow-hidden">
            <View className="items-center mb-5">
              <Text className="text-white font-bold text-lg">{name}</Text>
            </View>

            <Text className="text-textSecondary dark:text-textSecondary-dark text-sm mb-3 text-center">
              Seleccionar intervalo
            </Text>

            {customMode ? (
              <View>
                <TextInput
                  className="text-white bg-gray-700 border border-gray-500 rounded-lg px-4 py-3 text-base mb-4"
                  placeholder="Segundos (600-10800)"
                  placeholderTextColor="#9CA3AF"
                  value={customInput}
                  onChangeText={setCustomInput}
                  keyboardType="numeric"
                  autoFocus
                />
                <View className="flex-row justify-end gap-3">
                  <TouchableOpacity onPress={() => setCustomMode(false)}>
                    <Text className="text-gray-400 text-base">Volver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCustomSave}>
                    <Text className="text-green-400 font-semibold text-base">Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-center gap-2.5 mb-5">
                {SAVE_INTERVAL_OPTIONS.map((opt) => {
                  const isSelected = currentValue === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      className={`px-5 py-3 ${
                        isSelected
                          ? "bg-gray-600 border-green-500"
                          : "bg-gray-700/50 border-transparent"
                      }`}
                      onPress={() => handleSelect(opt.value)}
                    >
                      <Text
                        className={`text-base ${
                          isSelected
                            ? "text-text dark:text-text-dark font-bold"
                            : "text-textSecondary dark:text-textSecondary-dark"
                        }`}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  className="rounded-xl px-5 py-3 bg-gray-700/50"
                  onPress={() => setCustomMode(true)}
                >
                  <Text className="text-textSecondary dark:text-textSecondary-dark text-base">
                    Personalizado
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View className="border-t border-gray-600 my-4" />

            <View>
              <Text className="text-textSecondary dark:text-textSecondary-dark text-sm mb-1 text-center">
                Configurar umbral
              </Text>
              <Text className="text-white text-2xl font-bold text-center mb-3">
                {editingThreshold.toFixed(1)} PSI
              </Text>
              <View className="px-2 mb-5">
                <ThresholdSlider
                  value={editingThreshold}
                  onChange={setEditingThreshold}
                  onComplete={handleThresholdComplete}
                />
              </View>
              <View className="flex-row justify-between px-2 mb-4">
                <Text className="text-gray-500 text-xs">0</Text>
                <Text className="text-gray-500 text-xs">10</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}
