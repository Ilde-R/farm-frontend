import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
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
  onSetScale?: (scale: number) => void;
  onClose: () => void;
}

export default function SaveIntervalPicker({
  name,
  threshold,
  visible,
  currentValue,
  onSelect,
  onSetThreshold,
  onSetScale,
  onClose,
}: SaveIntervalPickerProps) {
  
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [editingThreshold, setEditingThreshold] = useState(threshold);
  const [scaleFactor, setScaleFactor] = useState("");

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
        "El intervalo debe estar entre 10 minutos y 3 horas"
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
    setScaleFactor("");
    onClose();
  }

  function handleThresholdComplete(value: number) {
    onSetThreshold?.(value);
    onClose();
  }

  function handleScaleSubmit() {
    console.log("¡Botón presionado! Validando escala:", scaleFactor);
    const scaleValue = parseFloat(scaleFactor);
    if (isNaN(scaleValue) || scaleValue <= 0) {
      Alert.alert("Error", "Ingrese un valor numérico válido mayor a 0");
      return;
    }
    
    // Verificamos si onSetScale existe
    if (onSetScale) {
        console.log("Llamando a onSetScale con el valor:", scaleValue);
        onSetScale(scaleValue);
        setScaleFactor("");
        Keyboard.dismiss(); // Ocultamos el teclado después de enviar
        Alert.alert("Éxito", "Comando de calibración enviado");
    } else {
        console.warn("ADVERTENCIA: La propiedad onSetScale no se definió en el componente padre");
        Alert.alert("Error de conexión", "La función para guardar la escala no está configurada.");
    }
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
            <View className="bg-[#313b59] rounded-t-2xl pt-6 pb-10 px-6 overflow-hidden max-h-[90%]">
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
                        className={`px-5 py-3 rounded-lg ${
                          isSelected
                            ? "bg-gray-600 border border-green-500"
                            : "bg-gray-700/50 border border-transparent"
                        }`}
                        onPress={() => handleSelect(opt.value)}
                      >
                        <Text
                          className={`text-base ${
                            isSelected
                              ? "text-white font-bold"
                              : "text-gray-400"
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    className="rounded-lg px-5 py-3 bg-gray-700/50"
                    onPress={() => setCustomMode(true)}
                  >
                    <Text className="text-gray-400 text-base">
                      Personalizado
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View className="border-t border-gray-600 my-4" />
              
              {/* --- SECCIÓN DE ESCALA INTEGRADA --- */}
              <View>
                <Text className="text-textSecondary dark:text-textSecondary-dark text-sm mb-3 text-center">
                  Configurar escala de calibración
                </Text>
                
                <View className="flex-row items-center justify-center gap-3 px-2">
                  <TextInput
                    className="text-white bg-gray-700 border border-gray-500 rounded-lg px-4 py-2 text-base flex-1"
                    placeholder="Ej. 1.05"
                    placeholderTextColor="#9CA3AF"
                    value={scaleFactor}
                    onChangeText={setScaleFactor}
                    keyboardType="numeric"
                  />
                  {/* Este es el botón que debe imprimir el log */}
                  <TouchableOpacity
                    className="bg-green-600 rounded-lg px-5 py-3 active:opacity-70"
                    onPress={handleScaleSubmit}
                  >
                    <Text className="text-white font-bold">Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* ----------------------------------- */}

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
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}