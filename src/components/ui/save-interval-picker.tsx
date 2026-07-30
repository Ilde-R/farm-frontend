import { useState } from "react";
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
  { value: 1800, label: "30 min" },
  { value: 3600, label: "1 hora" },
  { value: 7200, label: "2 horas" },
  { value: 10800, label: "3 horas" },
];

interface SaveIntervalPickerProps {
  name: string;
  visible: boolean;
  currentValue: number;
  onSelect: (value: number) => void;
  onClose: () => void;
}

export default function SaveIntervalPicker({
  name,
  visible,
  currentValue,
  onSelect,
  onClose,
}: SaveIntervalPickerProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={handleClose}
        />
        <Pressable
          className="bg-[#313b59] rounded-t-2xl pt-6 pb-10 px-6"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-text dark:text-text-dark font-bold text-lg mb-4 text-center">
            {name}
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
              <View className="flex-row justify-end" style={{ gap: 12 }}>
                <TouchableOpacity onPress={() => setCustomMode(false)}>
                  <Text className="text-gray-400 text-base">Volver</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCustomSave}>
                  <Text className="text-white font-semibold text-base">OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View
              className="flex-row flex-wrap justify-center"
              style={{ gap: 8 }}
            >
              {SAVE_INTERVAL_OPTIONS.map((opt) => {
                const isSelected = currentValue === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    className={`rounded-lg px-4 py-3 ${isSelected ? "bg-gray-600" : "bg-gray-700/50"}`}
                    onPress={() => handleSelect(opt.value)}
                  >
                    <Text
                      className={`text-base ${isSelected ? "text-white font-semibold" : "text-gray-300"}`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                className="rounded-lg px-4 py-3 bg-gray-700/50"
                onPress={() => setCustomMode(true)}
              >
                <Text className="text-gray-300 text-base">Personalizado</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </View>
    </Modal>
  );
}
