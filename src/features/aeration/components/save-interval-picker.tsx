import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import TextField from "../../../core/components/ui/text-field";
import ThresholdSlider from "../../../core/components/ui/threshold-slider";

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

  useEffect(() => {
    if (visible) {
      setEditingThreshold(threshold);
    }
  }, [visible, threshold]);

  function handleSelect(value: number) {
    onSelect(value);
    onClose();
  }

  const isCustomValue = !SAVE_INTERVAL_OPTIONS.some(
    (option) => option.value === currentValue,
  );

  function handleCustomSave() {
    const seconds = Number(customInput);
    if (
      !Number.isInteger(seconds) ||
      seconds < 60 ||
      seconds > 10800
    ) {
      Alert.alert(
        "Error",
        "El intervalo debe estar entre 60 segundos y 3 horas"
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
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/40 justify-end">
          {/* Fondo clickeable para cerrar */}
          <Pressable className="absolute inset-0" onPress={handleClose} />
          
          {/* Contenido del modal (sin Pressable envolviendo) */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="bg-backgroundElement rounded-t-2xl pt-6 pb-10 px-6 overflow-hidden max-h-[90%]  dark:bg-backgroundElement-dark">
              <View className="items-center mb-5">
                <Text className="text-text dark:text-text-dark font-bold text-lg">{name}</Text>
              </View>

              <Text className="text-textSecondary dark:text-textSecondary-dark text-sm mb-3 text-center">
                Seleccionar intervalo
              </Text>

              {customMode ? (
                <View>
                  <TextField
                    containerClassName="mb-4"
                    className="bg-gray-700 text-white"
                    placeholder="Segundos (60-10800)"
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
                        className={`px-5 py-3 rounded-lg ${
                          isSelected
                            ? "bg-backgroundSelected dark:bg-backgroundSelected-dark"
                            : "bg-background dark:bg-background-dark border border-transparent"
                        }`}
                        onPress={() => handleSelect(opt.value)}
                      >
                        <Text
                          className={`text-base ${
                            isSelected
                              ? "text-text dark:text-text-dark"
                              : "text-textSecondary dark:text-text-dark"
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    className={`rounded-lg px-5 py-3 ${
                      isCustomValue
                        // ? "bg-gray-600 border border-green-500"
                        ? 'bg-backgroundSelected dark:bg-backgroundSelected-dark'
                        // : "bg-gray-700/50 border border-transparent"
                        : 'bg-backgroundElement dark:bg-backgroundElement-dark'
                    }`}
                    onPress={() => {
                      setCustomInput(isCustomValue ? String(currentValue) : "");
                      setCustomMode(true);
                    }}
                  >
                    <Text
                      className={`text-base ${
                        isCustomValue
                          ? "text-text dark:text-text-dark font-bold"
                          : "text-textSecondary dark:text-textSecondary-dark"
                      }`}
                    >
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
                <Text className="text-text dark:text-text-dark text-2xl font-bold text-center mb-3">
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
                  <Text className="text-text dark:text-text-dark text-xs">0</Text>
                  <Text className="text-text dark:text-text-dark text-xs">10</Text>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}