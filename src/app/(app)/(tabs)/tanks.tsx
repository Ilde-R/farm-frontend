import ScreenLayout from "@/core/components/layout/ScreenLayout";
import TextField from "@/core/components/ui/text-field";
import { useTheme } from "@/core/theme/use-theme";
import { useBatch } from "@/features/batches/contexts/BatchContext";
import { getActiveBatchByTankId } from "@/features/batches/utils/batch.utils";
import TankCard, { getTankCardSize } from "@/features/tanks/components/tank-card";
import { TANK_STATUS_LABELS } from "@/features/tanks/constants/tank.constants";
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
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type TankFilter = TankStatus | "todos";

const TANK_SUMMARY_ITEMS: {
  status: TankFilter;
  label: string;
  icon: "water" | "water-off" | "wrench-outline" | "format-list-bulleted";
}[] = [
  { status: "todos", label: "Todos", icon: "format-list-bulleted" },
  { status: TankStatus.ACTIVE, label: "Activos", icon: "water" },
  { status: TankStatus.EMPTY, label: "Vacíos", icon: "water-off" },
  { status: TankStatus.MAINTENANCE, label: "Mantenimiento", icon: "wrench-outline" },
];

export default function TanksScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const tankCardSize = getTankCardSize(width);
  const router = useRouter();
  
  const { createTank, tanks, isLoading, fetchTanks } = useTank();
  const { batches, fetchBatches } = useBatch();
  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);
  useEffect(() => {
    void fetchBatches().catch((error) => {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudieron cargar los lotes.",
      );
    });
  }, [fetchBatches]);

  const activeBatchByTankId = getActiveBatchByTankId(batches);

  const [showAddModal, setShowAddModal] = useState(false);
  
  const [tankNumber, setTankNumber] = useState("");
  const [tankStatus, setTankStatus] = useState<TankStatus>(TankStatus.EMPTY);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tankFilter, setTankFilter] = useState<TankFilter>("todos");

  const iconSize = Math.round(width * 0.06);
  const filteredTanks =
    tankFilter === "todos"
      ? tanks
      : tanks.filter((tank) => tank.tankStatus === tankFilter);

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
    setTankStatus(TankStatus.EMPTY);
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
      await createTank({
        tankNumber: number,
        tankStatus: tankStatus,
      });

      closeAddModal();
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

  const HeaderButtons = (
    <>
      <TouchableOpacity onPress={() => setShowAddModal(true)} hitSlop={8}>
        <MaterialCommunityIcons
          name="plus"
          size={iconSize}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
    </>
  );

  return (
    <>
      <ScreenLayout
        title="Tanques"
        headerRight={HeaderButtons}
        isScrollable={true}
      >
        <View className="flex-row flex-wrap justify-between gap-y-5 px-4 pt-4">
          {tanks.length > 0 && (
            <View className="w-full">
              <Text className="mb-3 text-base font-semibold text-text dark:text-text-dark">
                Resumen de tanques
              </Text>
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {TANK_SUMMARY_ITEMS.map(({ status, label, icon }) => {
                  const count =
                    status === "todos"
                      ? tanks.length
                      : tanks.filter((tank) => tank.tankStatus === status).length;
                  const isSelected = tankFilter === status;

                  return (
                    <TouchableOpacity
                      key={status}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      className={`w-[48%] flex-row items-center rounded-xl border px-3 py-3 ${
                        isSelected
                          ? "border-white/30 bg-[#202a40]"
                          : "border-white/10 bg-[#202a40]"
                      }`}
                      onPress={() => setTankFilter(status)}
                    >
                      <View className="mr-3 h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                        <MaterialCommunityIcons
                          name={icon}
                          size={19}
                          color={isSelected ? theme.text : theme.textSecondary}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          numberOfLines={1}
                          className="text-xs text-textSecondary dark:text-textSecondary-dark"
                        >
                          {label}
                        </Text>
                        <Text className="text-lg font-bold text-text dark:text-text-dark">
                          {count}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {isLoading && (
            <ActivityIndicator size="large" color={theme.text} className="mt-10"/>
          )}

          {!isLoading && tanks.length === 0 && (
            <View className="w-full items-center py-12">
              <MaterialCommunityIcons
                name="water-off"
                size={36}
                color={theme.textSecondary}
              />
              <Text className="mt-3 text-center font-medium text-text dark:text-text-dark">
                No hay tanques registrados
              </Text>
              <Text className="mt-1 text-center text-sm text-textSecondary dark:text-textSecondary-dark">
                Usa el botón + para registrar el primero.
              </Text>
            </View>
          )}

          {!isLoading && tanks.length > 0 && filteredTanks.length === 0 && (
            <View className="w-full items-center py-10">
              <MaterialCommunityIcons
                name="water-off"
                size={32}
                color={theme.textSecondary}
              />
              <Text className="mt-3 text-center font-medium text-text dark:text-text-dark">
                No hay tanques en este estado
              </Text>
            </View>
          )}

          {!isLoading && filteredTanks.map((tank) => (
            <View key={tank.id} className="w-[48%] items-center">
              <TankCard
                size={tankCardSize}
                tankNumber={tank.tankNumber}
                tankStatus={tank.tankStatus}
                currentQuantity={activeBatchByTankId.get(tank.id)?.currentQuantity}
                onPress={() => router.push({
                  pathname: "/tanks/[id]/edit",
                  params: { id: tank.id }
                })}
              />
            </View>
          ))}
        </View>
      </ScreenLayout>

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
                    label={TANK_STATUS_LABELS[statusValue as TankStatus] || statusValue} 
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
    </>
  );
}