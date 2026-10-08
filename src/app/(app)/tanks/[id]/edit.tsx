import ScreenLayout from "@/core/components/layout/ScreenLayout";
import { useTheme } from "@/core/theme/use-theme";
import { useBatch } from "@/features/batches/contexts/BatchContext";
import { BatchStatus } from "@/features/batches/types/batch";
import { useTankMovement } from "@/features/tank-movements/contexts/TankMovementContext";
import { MovementType, type TankMovement } from "@/features/tank-movements/types/tank-movement";
import DayPickerModal from "@/features/tanks/components/day-picker-modal";
import MovementForm from "@/features/tanks/components/movement-form";
import TankCard, { getTankCardSize } from "@/features/tanks/components/tank-card";
import TankStatusPicker from "@/features/tanks/components/tank-status-picker";
import { TANK_STATUS_CONFIG } from "@/features/tanks/constants/tank.constants";
import { useTank } from "@/features/tanks/contexts/TankContext";
import { TankStatus } from "@/features/tanks/types/tank";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";

export default function EditTankScreen() {
  const { tanks, updateTank, fetchTanks, deleteTank } = useTank();
  const {
    createTankMovementTransfer,
    createTankMovementOutflows,
    tankMovements,
    isLoading: isMovementLoading,
    fetchTankMovements,
  } = useTankMovement();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const tankCardSize = getTankCardSize(width);

  // Iniciar siembra
  const { batches, createBatch, fetchBatches } = useBatch();
  const currentTank = tanks.find((t) => t.id === id);
  const tankNumber = currentTank?.tankNumber ?? (Number(id) || 1);

  useEffect(() => {
    void fetchTanks();
  }, [fetchTanks]);

  useEffect(() => {
    void fetchBatches().catch((error) => {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudieron cargar los lotes.",
      );
    });
  }, [fetchBatches]);

  useEffect(() => {
    if (!id) return;

    void fetchTankMovements(id).catch((error) => {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los movimientos del tanque.",
      );
    });
  }, [fetchTankMovements, id]);

  const tankBatches = batches
    .filter((batch) => batch.tankId === currentTank?.id)
    .sort(
      (first, second) =>
        new Date(second.stockingDate).getTime() -
        new Date(first.stockingDate).getTime(),
    );
  const activeTankBatch = tankBatches.find(
    (batch) => batch.batchesStatus === BatchStatus.ACTIVE,
  );
  const tankBatch =
    activeTankBatch ?? tankBatches[0];
  const stockingDate = tankBatch
    ? new Date(tankBatch.stockingDate).toLocaleString("es-MX")
    : null;

  const iconSize = Math.round(width * 0.06);

  const [status, setStatus] = useState<TankStatus>(
    currentTank?.tankStatus ?? TankStatus.EMPTY
  );
  const [size, setSize] = useState("Mediano");

  useEffect(() => {
    if (currentTank) {
      setStatus(currentTank.tankStatus);
    }
  }, [currentTank?.tankStatus]);
  
  const [showDailyForm, setShowDailyForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isDeleting, setIsDeleting] = useState(false);

  const statusConfig = TANK_STATUS_CONFIG[status] || { form: "daily", label: "Activo" };

  const movementsData = tankMovements?.tank.id === id ? tankMovements : null;
  const movementsById = new Map<string, TankMovement>();
  for (const group of movementsData?.incoming.fromTanks ?? []) {
    for (const movement of group.movements) movementsById.set(movement.id, movement);
  }
  for (const group of movementsData?.outgoing.toTanks ?? []) {
    for (const movement of group.movements) movementsById.set(movement.id, movement);
  }
  for (const group of movementsData?.outgoing.otherMovements ?? []) {
    for (const movement of group.movements) movementsById.set(movement.id, movement);
  }

  const movementDates = [
    ...new Map(
      [...movementsById.values()].map((movement) => {
        const date = new Date(movement.movementDate);
        return [date.toDateString(), date] as const;
      }),
    ).values(),
  ];

  const selectedDateMovements = [...movementsById.values()]
    .filter((movement) => {
      const movementDate = new Date(movement.movementDate);
      return (
        movementDate.getFullYear() === selectedDate.getFullYear() &&
        movementDate.getMonth() === selectedDate.getMonth() &&
        movementDate.getDate() === selectedDate.getDate()
      );
    })
    .sort(
      (first, second) =>
        new Date(second.movementDate).getTime() -
        new Date(first.movementDate).getTime(),
    );

  function getMovementLabel(type: MovementType) {
    switch (type) {
      case MovementType.TRANSFER:
        return "Traslado";
      case MovementType.SALE:
        return "Venta";
      case MovementType.MORTALITY:
        return "Mortandad";
    }
  }

  function getMovementDescription(movement: TankMovement) {
    if (movement.movementType === MovementType.TRANSFER) {
      if (movement.sourceTankId === currentTank?.id && movement.destinationTank) {
        return `Destino: Tanque ${movement.destinationTank.tankNumber}`;
      }
      if (movement.sourceTank) {
        return `Origen: Tanque ${movement.sourceTank.tankNumber}`;
      }
    }
    if (movement.notes?.trim()) return movement.notes;
    if (movement.movementType === MovementType.SALE) return "Venta registrada";
    if (movement.movementType === MovementType.MORTALITY) return "Mortandad registrada";
    return "Traslado registrado";
  }

  async function handleEdit() {
    if (!id) {
      Alert.alert("Error", "No se encontró el ID del tanque.");
      return;
    }

    if (!currentTank) {
      Alert.alert("Error", "Los datos del tanque aún no se han cargado. Espera un momento.");
      return;
    }

    try {
      const payload = {
        tankNumber: currentTank.tankNumber,
        tankStatus: status,
      };

      await updateTank(payload, id);

      Alert.alert("Guardado", "Los cambios del tanque fueron guardados.");
      router.back();
    } catch (error) {
      console.error("DETALLE DEL ERROR AL GUARDAR:", error);
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    }
  }

  async function handleDeleteTank() {
    if (!id || !currentTank) {
      Alert.alert("Error", "No se encontraron los datos del tanque.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTank(id);
      Alert.alert(
        "Estanque eliminado",
        `El estanque ${currentTank.tankNumber} se eliminó correctamente.`,
        [
          {
            text: "Aceptar",
            onPress: () => router.replace("/(app)/(tabs)/tanks"),
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      Alert.alert(
        "No se pudo eliminar",
        error instanceof Error ? error.message : "Ocurrió un error al eliminar el estanque.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function confirmDeleteTank() {
    if (!currentTank) {
      Alert.alert("Error", "No se encontraron los datos del tanque.");
      return;
    }

    Alert.alert(
      "Eliminar estanque",
      `¿Seguro que deseas eliminar el estanque ${currentTank.tankNumber}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void handleDeleteTank();
          },
        },
      ],
    );
  }

  const HeaderRight = (
    <TouchableOpacity hitSlop={8}>
      <MaterialCommunityIcons
        name="water"
        size={iconSize}
        color={theme.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <>
      <ScreenLayout
        title={`Editar tanque ${currentTank?.tankNumber ?? ""}`}
        showBackButton={true}
        headerRight={HeaderRight}
        isScrollable={false}
      >
        <View className="mx-1 mt-3 flex-row items-center border-b border-backgroundSelected pb-3">
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={20}
            color={theme.textSecondary}
          />
          <View className="flex-1">
            <Text className="ml-3 text-sm text-textSecondary dark:text-textSecondary-dark">
              Fecha de siembra
            </Text>
            <Text className="ml-3 mt-0.5 font-medium text-text dark:text-text-dark">
              {stockingDate ?? "Sin siembra registrada"}
            </Text>
          </View>
        </View>
        <View className="items-center mt-6">
          <TankCard
            size={tankCardSize}
            tankNumber={currentTank?.tankNumber ?? 1}
            tankStatus={status}
          />
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          className="mx-1 mt-4 flex-row items-center justify-between rounded-xl border border-backgroundSelected px-4 py-3"
          onPress={() => router.push(`/tanks/${id}/batches`)}
        >
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={20}
              color={theme.textSecondary}
            />
            <Text className="ml-3 font-medium text-text dark:text-text-dark">
              Ver lotes ({tankBatches.length})
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        <View className="flex-1 pt-6 px-1">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="w-full">
            
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ expanded: showDailyForm }}
                className={`mb-4 flex-row items-center rounded-2xl border p-4 ${
                  showDailyForm
                    ? "border-white/15 bg-[#202a40]"
                    : "border-cyan-400/20 bg-cyan-400/10"
                }`}
                onPress={() => setShowDailyForm((isOpen) => !isOpen)}
              >
                <View
                  className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${
                    showDailyForm ? "bg-white/10" : "bg-cyan-400/10"
                  }`}
                >
                  <MaterialCommunityIcons
                    name={
                      showDailyForm
                        ? "close"
                        : statusConfig.form === "sowing"
                          ? "fish"
                          : "plus"
                    }
                    size={22}
                    color={showDailyForm ? "#cbd5e1" : "#67e8f9"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-text dark:text-text-dark">
                    {showDailyForm
                      ? "Cerrar formulario"
                      : statusConfig.form === "sowing"
                        ? "Iniciar siembra"
                        : "Agregar registro diario"}
                  </Text>
                  {!showDailyForm && (
                    <Text className="mt-1 text-xs text-textSecondary dark:text-textSecondary-dark">
                      {statusConfig.form === "sowing"
                        ? "Registrar la población inicial"
                        : "Capturar un movimiento del tanque"}
                    </Text>
                  )}
                </View>
                <MaterialCommunityIcons
                  name={showDailyForm ? "chevron-up" : "chevron-down"}
                  size={22}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>

              {showDailyForm && (
                <MovementForm
                  formType={statusConfig.form as "sowing" | "daily"}
                  tankId={currentTank?.id}
                  availableTanks={tanks.filter((tank) => tank.id !== currentTank?.id)}
                  onCancel={() => setShowDailyForm(false)}
                  onSave={async (movementData) => {
                    if (movementData.type === "Siembra") {
                      if (!currentTank) {
                        Alert.alert("Error", "No se encontraron los datos del tanque.");
                        return;
                      }

                      try {
                        await createBatch({
                          tankId: movementData.tankId,
                          initialQuantity: movementData.initialQuantity,
                          stockingDate: movementData.stockingDate,
                        });
                        await fetchTanks();
                        setShowDailyForm(false);
                        Alert.alert("Éxito", "La siembra se inició correctamente.");
                      } catch (error) {
                        Alert.alert(
                          "Error",
                          error instanceof Error
                            ? error.message
                            : "No se pudo iniciar la siembra.",
                        );
                      }
                      return;
                    }

                    if (!activeTankBatch) {
                      Alert.alert("Error", "Este tanque no tiene un lote activo para registrar movimientos.");
                      return;
                    }

                    try {
                      if (movementData.type === MovementType.TRANSFER) {
                        await createTankMovementTransfer({
                          batchId: activeTankBatch.id,
                          destinationTankId: movementData.destinationTankId,
                          quantity: movementData.quantity,
                          movementDate: movementData.movementDate,
                        });
                      } else {
                        await createTankMovementOutflows({
                          batchId: activeTankBatch.id,
                          movementType: movementData.type,
                          quantity: movementData.quantity,
                          movementDate: movementData.movementDate,
                        });
                      }

                      setShowDailyForm(false);
                      let refreshFailed = false;
                      try {
                        await Promise.all([
                          fetchBatches(),
                          fetchTanks(),
                          ...(id ? [fetchTankMovements(id)] : []),
                        ]);
                      } catch (refreshError) {
                        refreshFailed = true;
                        console.error("Error al actualizar datos después del movimiento:", refreshError);
                      }
                      Alert.alert(
                        refreshFailed ? "Movimiento registrado" : "Éxito",
                        refreshFailed
                          ? "El movimiento se guardó, pero no se pudieron actualizar los datos de la pantalla."
                          : "El movimiento se registró correctamente.",
                      );
                    } catch (error) {
                      Alert.alert(
                        "Error",
                        error instanceof Error
                          ? error.message
                          : "No se pudo registrar el movimiento.",
                      );
                    }
                  }}
                />
              )}

              {statusConfig.form === "daily" && (
                <>
                  <View className="mb-2 flex-row items-center">
                    <MaterialCommunityIcons
                      name="fish"
                      size={18}
                      color={theme.textSecondary}
                    />
                    <Text className="ml-2 font-semibold text-text dark:text-text-dark">
                      Tamaño del pez
                    </Text>
                  </View>
                  <View className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-[#1b2338]">
                    <Picker
                      selectedValue={size}
                      onValueChange={(itemValue) => setSize(itemValue)}
                      style={{ color: "#f8fafc", backgroundColor: "#1b2338" }}
                    >
                      <Picker.Item label="Chico" value="Chico" />
                      <Picker.Item label="Mediano" value="Mediano" />
                      <Picker.Item label="Grande" value="Grande" />
                    </Picker>
                  </View>
                </>
              )}

              <View className="mb-2 flex-row items-center">
                <MaterialCommunityIcons
                  name="water"
                  size={18}
                  color={theme.textSecondary}
                />
                <Text className="ml-2 font-semibold text-text dark:text-text-dark">
                  Estado del tanque
                </Text>
              </View>
              <TankStatusPicker value={status} onChange={setStatus} />

              {statusConfig.form === "daily" && (
                <>
                  <TouchableOpacity
                    accessibilityRole="button"
                    className="mb-4 mt-2 flex-row items-center rounded-2xl border border-white/10 bg-[#29334d] p-4"
                    onPress={() =>
                      router.push({
                        pathname: "/tanks/[id]/map" as any,
                        params: { id: String(currentTank?.id ?? id) },
                      })
                    }
                  >
                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                      <MaterialCommunityIcons
                        name="map-marker-path"
                        size={22}
                        color="#67e8f9"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-white">
                        Mapa de traslado
                      </Text>
                      <Text className="mt-1 text-xs text-slate-400">
                        Ver rutas entre tanques
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={22}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>

                  <View className="flex-row items-center justify-between mb-4 mt-2" style={{ gap: 10 }}>
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center bg-text rounded-xl px-3 py-3"
                      onPress={() => setShowHistory((visible) => !visible)}
                    >
                      <MaterialCommunityIcons
                        name={showHistory ? "chevron-up" : "history"}
                        size={20}
                        color="#181F3B"
                      />
                      <Text className="text-background font-semibold ml-2">
                        {showHistory ? "Ocultar historial" : "Ver historial"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center border border-backgroundSelected rounded-xl px-3 py-3"
                      onPress={() => setShowDatePicker(true)}
                    >
                      <MaterialCommunityIcons name="calendar" size={20} color={theme.textSecondary} />
                      <Text className="text-text dark:text-text-dark font-semibold ml-2">
                        {selectedDate.toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {showHistory && (
                    <View className="mb-5">
                      {isMovementLoading ? (
                        <ActivityIndicator
                          className="py-6"
                          size="small"
                          color={theme.text}
                        />
                      ) : selectedDateMovements.length === 0 ? (
                        <Text className="text-textSecondary text-center py-6">
                          No hay movimientos registrados este día.
                        </Text>
                      ) : (
                        selectedDateMovements.map((movement, index) => (
                          <View key={movement.id} className="flex-row">
                            <View className="items-center mr-3" style={{ width: 32 }}>
                              <View className="w-8 h-8 rounded-full bg-[#29334d] items-center justify-center">
                                <MaterialCommunityIcons
                                  name={
                                    movement.movementType === MovementType.TRANSFER
                                      ? "swap-horizontal"
                                      : movement.movementType === MovementType.SALE
                                      ? "cart-arrow-down"
                                      : "skull-crossbones"
                                  }
                                  size={18}
                                  color={
                                    movement.movementType === MovementType.TRANSFER
                                      ? "#34d399"
                                      : movement.movementType === MovementType.SALE
                                      ? "#60a5fa"
                                      : "#f87171"
                                  }
                                />
                              </View>
                              {index < selectedDateMovements.length - 1 && (
                                <View className="flex-1 w-px bg-backgroundSelected" />
                              )}
                            </View>
                            <View className="flex-1 pb-5">
                              <Text className="text-textSecondary text-xs mb-1">
                                {new Date(movement.movementDate).toLocaleString("es-MX")}
                              </Text>
                              <View className="bg-[#202a40] rounded-xl p-3">
                                <View className="flex-row items-center justify-between">
                                  <Text className="text-text dark:text-text-dark font-semibold">
                                    {getMovementLabel(movement.movementType)}
                                  </Text>
                                  <Text className="text-text dark:text-text-dark font-bold">
                                    {movement.quantity} peces
                                  </Text>
                                </View>
                                <Text className="text-textSecondary mt-1">
                                  {getMovementDescription(movement)}
                                </Text>
                              </View>
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </>
              )}
              <TouchableOpacity
                accessibilityRole="button"
                className="mt-4 flex-1 rounded-lg bg-text py-3"
                onPress={() =>
                  Alert.alert(
                    "Cosecha no disponible",
                    "El backend todavía no ofrece una operación para cerrar el lote y marcar el tanque como vacío. No se hicieron cambios.",
                  )
                }
              >
                <Text className="text-background font-semibold text-base text-center">
                  Cosechar estanque
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View className="flex-row mt-4 mb-2" style={{ gap: 12 }}>
            <TouchableOpacity
              className="flex-1 bg-text rounded-lg py-3"
              onPress={handleEdit}
            >
              <Text className="text-background font-semibold text-base text-center">
                Guardar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 border border-backgroundSelected rounded-lg py-3"
              onPress={() => router.back()}
            >
              <Text className="text-text dark:text-text-dark font-semibold text-base text-center">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            className="mb-2 flex-row items-center justify-center rounded-lg border border-red-400/40 py-3"
            onPress={confirmDeleteTank}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#f87171" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={18}
                  color="#f87171"
                />
                <Text className="ml-2 font-semibold text-red-400">
                  Eliminar estanque
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScreenLayout>

      <DayPickerModal 
        visible={showDatePicker} 
        selectedDate={selectedDate}
        movementDates={movementDates}
        onDateChange={setSelectedDate}
        onClose={() => setShowDatePicker(false)} 
      />
    </>
  );
}