import TankCard from "@/core/components/tank-card";
import { useTheme } from "@/core/theme/use-theme";
import { useTank } from "@/features/tanks/contexts/TankContext";
import { TankStatus } from "@/features/tanks/types/tank";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_LABELS: Record<TankStatus, string> = {
  [TankStatus.ACTIVE]: "Activo",
  // Se agregaram mas estados
};

export default function TanksScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  
  const { create, tanks, isLoading, fetchTanks } = useTank();
  useEffect(()=> {
    fetchTanks();
  }, [fetchTanks]);

  const [showAddModal, setShowAddModal] = useState(false);
  
  const [tankNumber, setTankNumber] = useState("");
  const [tankStatus, setTankStatus] = useState<TankStatus>(TankStatus.ACTIVE);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const iconSize = Math.round(width * 0.06);
  const margin = Math.round(width * 0.04);

  function clearError(field: string) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function closeAddModal() {
    setShowAddModal(false);
    setTankNumber("");
    setTankStatus(TankStatus.ACTIVE);
    setErrors({});
  }

  async function handleAddTank() {
    const newErrors: Record<string, string> = {};
    const number = Number(tankNumber.trim());

    if (!tankNumber.trim()) {
      newErrors.tankNumber = "El número de tanque es requerido";
    } else if (!Number.isInteger(number) || number < 1) {
      newErrors.tankNumber = "Ingresa un número entero mayor a 0";
    } 

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await create({
        tankNumber: number,
        tankStatus: tankStatus,
      });

      closeAddModal();
      Alert.alert("Éxito", "El tanque se guardó correctamente.");
      
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo registrar el tanque");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: margin, paddingTop: margin }}
      >
        <Text
          style={{ fontSize: iconSize * 1.2 }}
          className="font-bold text-text dark:text-text-dark"
        >
          Tanques
        </Text>
        <View className="flex-row items-center" style={{ gap: margin }}>
          <TouchableOpacity onPress={() => setShowAddModal(true)} hitSlop={8}>
            <MaterialCommunityIcons
              name="plus"
              size={iconSize}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView className="flex-1 bg-background">
        <View className="flex-row flex-wrap justify-center gap-4 p-4">
          {isLoading && (
            <ActivityIndicator size="large" color={theme.text} className="mt-10"/>
          )}

          {!isLoading && tanks?.map((tank) => (
            <TankCard 
              key={tank.id}
              tankNumber={tank.tankNumber} 
              tankStatus={tank.tankStatus} 
              // onPress={() => ())} <-- mandara a otra pantalla
            />
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={closeAddModal}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-xl bg-background p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-text dark:text-text-dark">
                Registrar tanque
              </Text>
              <TouchableOpacity onPress={closeAddModal} hitSlop={8} disabled={loading}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text className="mb-1 font-semibold text-text dark:text-text-dark">
              Número de tanque
            </Text>
            <TextInput
              className={`mb-2 rounded-lg border px-4 py-3 text-text dark:text-text-dark ${
                errors.tankNumber ? "border-red-500" : "border-backgroundSelected"
              }`}
              placeholder="Ej: 3"
              placeholderTextColor={theme.textSecondary}
              value={tankNumber}
              onChangeText={(text) => {
                setTankNumber(text);
                clearError("tankNumber");
              }}
              keyboardType="number-pad"
              editable={!loading}
            />
            {errors.tankNumber && (
              <Text className="text-red-500 text-xs mb-4">{errors.tankNumber}</Text>
            )}
            {!errors.tankNumber && <View className="mb-4" />}

            <Text className="mb-1 font-semibold text-text dark:text-text-dark">
              Estado
            </Text>
            <View className="mb-6 overflow-hidden rounded-lg border border-backgroundSelected">
              <Picker
                selectedValue={tankStatus}
                onValueChange={(value) => setTankStatus(value as TankStatus)}
                style={{ color: theme.text }}
                enabled={!loading}
              >
                {Object.values(TankStatus).map((statusValue) => (
                  <Picker.Item 
                    key={statusValue} 
                    label={STATUS_LABELS[statusValue as TankStatus] || statusValue} 
                    value={statusValue} 
                  />
                ))}
              </Picker>
            </View>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                className="rounded-lg px-4 py-3"
                onPress={closeAddModal}
                disabled={loading}
              >
                <Text className="font-semibold text-textSecondary dark:text-textSecondary-dark">
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`rounded-lg px-4 py-3 flex-row items-center justify-center min-w-[100px] ${
                  loading ? "bg-gray-400" : "bg-text dark:bg-text-dark"
                }`}
                onPress={handleAddTank}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.background} size="small" />
                ) : (
                  <Text className="font-semibold text-background">Agregar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}