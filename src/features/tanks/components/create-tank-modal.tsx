import TextField from "@/core/components/ui/text-field";
import { useTheme } from "@/core/theme/use-theme";
import { TANK_STATUS_LABELS } from "@/features/tanks/constants/tank.constants";
import { useTank } from "@/features/tanks/contexts/TankContext";
import { TankStatus } from "@/features/tanks/types/tank";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type CreateTankModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function CreateTankModal({ visible, onClose }: CreateTankModalProps) {
  const theme = useTheme();
  const { createTank } = useTank();

  const [tankNumber, setTankNumber] = useState("");
  const [tankStatus, setTankStatus] = useState<TankStatus>(TankStatus.EMPTY);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!visible) {
      setTankNumber("");
      setTankStatus(TankStatus.EMPTY);
      setErrors({});
    }
  }, [visible]);

  function clearError(field: string) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleCreate() {
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
      await createTank({
        tankNumber: number,
        tankStatus: tankStatus,
      });

      onClose();
      Alert.alert("Éxito", "El tanque se guardó correctamente.");
    } catch (error) {
      if (
        error instanceof Error &&
        /el tanque número \d+ ya está registrado\.?/i.test(error.message)
      ) {
        setErrors({ tankNumber: error.message });
      } else {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "No se pudo registrar el tanque",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full rounded-xl bg-backgroundElement dark:bg-backgroundElement-dark p-6">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-text dark:text-text-dark">
              Registrar tanque
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8} disabled={loading}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TextField
            label="Número de tanque"
            containerClassName="mb-4"
            placeholder="Ej: 3"
            placeholderTextColor={theme.textSecondary}
            value={tankNumber}
            error={errors.tankNumber}
            onChangeText={(text) => {
              setTankNumber(text);
              clearError("tankNumber");
            }}
            keyboardType="number-pad"
            editable={!loading}
          />

          <Text className="mb-1 font-semibold text-text dark:text-text-dark">
            Estado
          </Text>
          <View className="mb-6 overflow-hidden rounded-lg border border-backgroundSelected dark:border-backgroundSelected-dark">
            <Picker
              selectedValue={tankStatus}
              onValueChange={(value) => setTankStatus(value as TankStatus)}
              style={{ color: theme.text }}
              enabled={!loading}
            >
              {Object.values(TankStatus).map((statusValue) => (
                <Picker.Item
                  key={statusValue}
                  label={TANK_STATUS_LABELS[statusValue as TankStatus] || statusValue}
                  value={statusValue}
                />
              ))}
            </Picker>
          </View>

          <View className="flex-row justify-end gap-3">
            <TouchableOpacity
              className="rounded-lg px-4 py-3"
              onPress={onClose}
              disabled={loading}
            >
              <Text className="font-semibold text-textSecondary dark:text-textSecondary-dark">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`rounded-lg px-4 py-3 flex-row items-center justify-center min-w-[100px] ${
                loading ? "bg-textSecondary dark:bg-textSecondary-dark"
                        : "bg-text dark:bg-text-dark"
              }`}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.background} size="small" />
              ) : (
                <Text className="font-semibold text-background dark:text-background-dark ">
                  Agregar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
