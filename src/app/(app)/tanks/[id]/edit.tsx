import ScreenLayout from "@/core/components/layout/ScreenLayout";
import Button from "@/core/components/ui/button";
import EmptyState from "@/core/components/ui/empty-state";
import { useToast } from "@/core/components/ui/toast";
import { useTheme } from "@/core/theme/use-theme";
import { logger } from "@/core/utils/logger";
import { useBatch } from "@/features/batches/contexts/BatchContext";
import { getActiveBatchByTankId } from "@/features/batches/utils/batch.utils";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function EditTankScreen() {
  const { tanks, updateTank, fetchTanks, deleteTank, isLoading: isTanksLoading } = useTank();
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
  const toast = useToast();
  const { width } = useWindowDimensions();
  const tankCardSize = getTankCardSize(width);

  const { batches, createBatch, fetchBatches } = useBatch();
  const currentTank = tanks.find((t) => t.id === id);

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
  const activeTankBatch = currentTank
    ? getActiveBatchByTankId(batches).get(currentTank.id)
    : undefined;
  const tankBatch = activeTankBatch ?? tankBatches[0];
  const stockingDate = tankBatch
    ? new Date(tankBatch.stockingDate).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const [status, setStatus] = useState<TankStatus>(
    currentTank?.tankStatus ?? TankStatus.EMPTY
  );
  const [showDailyForm, setShowDailyForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (currentTank) {
      setStatus(currentTank.tankStatus);
    }
  }, [currentTank?.tankStatus]);

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

  const latestMovementTime = movementDates.reduce(
    (latest, date) => Math.max(latest, date.getTime()),
    0,
  );

  // Si el usuario no ha elegido una fecha manualmente, abrimos el día del
  // movimiento más reciente para no caer siempre en el vacío de "hoy".
  const hasPickedDate = useRef(false);

  useEffect(() => {
    if (hasPickedDate.current || latestMovementTime === 0) return;
    setSelectedDate((current) =>
      current.getTime() === latestMovementTime ? current : new Date(latestMovementTime),
    );
  }, [latestMovementTime]);

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

  function getMovementLabel(movement: TankMovement) {
    switch (movement.movementType) {
      case MovementType.TRANSFER:
        return movement.sourceTankId === currentTank?.id
          ? "Salieron"
          : "Ingresaron";
      case MovementType.SALE:
        return "Venta";
      case MovementType.MORTALITY:
        return "Mortandad";
    }
  }

  function getMovementDescription(movement: TankMovement) {
    if (movement.movementType === MovementType.TRANSFER) {
      if (movement.sourceTankId === currentTank?.id && movement.destinationTank) {
        return `Hacia tanque ${movement.destinationTank.tankNumber}`;
      }
      if (movement.sourceTank) {
        return `Desde tanque ${movement.sourceTank.tankNumber}`;
      }
    }
    if (movement.notes?.trim()) return movement.notes;
    if (movement.movementType === MovementType.SALE) return "Venta registrada";
    if (movement.movementType === MovementType.MORTALITY) return "Mortandad registrada";
    return "Traslado registrado";
  }

  async function handleStatusChange(nextStatus: TankStatus) {
    if (!id) {
      Alert.alert("Error", "No se encontró el ID del tanque.");
      return;
    }

    if (!currentTank) {
      Alert.alert("Error", "Los datos del tanque aún no se han cargado. Espera un momento.");
      return;
    }

    const previousStatus = currentTank.tankStatus;
    setStatus(nextStatus);
    setIsSavingStatus(true);
    try {
      await updateTank({ tankStatus: nextStatus }, id);
      toast.show({ message: "Estado del tanque actualizado.", type: "success" });
    } catch (error) {
      setStatus(previousStatus);
      Alert.alert(
        "No se pudo guardar",
        error instanceof Error ? error.message : "No se pudo actualizar el estado del tanque.",
      );
    } finally {
      setIsSavingStatus(false);
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
      toast.show({
        message: `El tanque ${currentTank.tankNumber} se eliminó correctamente.`,
        type: "success",
      });
      router.replace("/(app)/(tabs)/tanks");
    } catch (error) {
      Alert.alert(
        "No se pudo eliminar",
        error instanceof Error ? error.message : "Ocurrió un error al eliminar el tanque.",
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
      "Eliminar tanque",
      `¿Seguro que deseas eliminar el tanque ${currentTank.tankNumber}? Esta acción no se puede deshacer.`,
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

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchTanks(),
        fetchBatches(),
        ...(id ? [fetchTankMovements(id)] : []),
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudieron actualizar los datos.",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  if (!currentTank) {
    return (
      <ScreenLayout title="Tanque" showBackButton isScrollable={false}>
        {isTanksLoading || tanks.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <EmptyState
            icon="water-off"
            title="No se encontró el tanque"
            actionLabel="Volver a tanques"
            onAction={() => router.replace("/(app)/(tabs)/tanks")}
          />
        )}
      </ScreenLayout>
    );
  }

  return (
    <>
      <ScreenLayout
        title={`Tanque ${currentTank.tankNumber}`}
        showBackButton={true}
        isScrollable
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      >
        <View className="mt-3 flex-row items-center border-b border-border dark:border-border-dark pb-3">
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
        <View className="mt-5 items-center">
          <TankCard
            size={tankCardSize}
            tankNumber={currentTank.tankNumber}
            tankStatus={status}
            currentQuantity={activeTankBatch?.currentQuantity}
            stockingDate={tankBatch?.stockingDate}
          />
        </View>
        <View className="pt-5">
          <View className="w-full">
            <Text className="mb-3 text-base font-semibold text-text dark:text-text-dark">
              Registro del tanque
            </Text>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ expanded: showDailyForm }}
              className={`mb-4 flex-row items-center rounded-lg border p-4 ${
                showDailyForm
                  ? "border-backgroundSelected dark:border-backgroundSelected-dark bg-backgroundSelected dark:bg-backgroundSelected-dark"
                  : "border-backgroundSelected dark:border-backgroundSelected-dark bg-backgroundElement dark:bg-backgroundElement-dark"
              }`}
              onPress={() => setShowDailyForm((isOpen) => !isOpen)}
            >
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-backgroundSelected dark:bg-backgroundSelected-dark">
                <MaterialCommunityIcons
                  name={
                    showDailyForm
                      ? "close"
                      : statusConfig.form === "sowing"
                        ? "fish"
                        : "plus"
                  }
                  size={22}
                  color={theme.textSecondary}
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
                tankId={currentTank.id}
                maxQuantity={activeTankBatch?.currentQuantity}
                availableTanks={tanks.filter((tank) => tank.id !== currentTank.id)}
                onSave={async (movementData) => {
                  if (movementData.type === "Siembra") {
                    try {
                      await createBatch({
                        tankId: movementData.tankId,
                        initialQuantity: movementData.initialQuantity,
                        stockingDate: movementData.stockingDate,
                      });
                      await fetchTanks();
                      setShowDailyForm(false);
                      toast.show({
                        message: "La siembra se inició correctamente.",
                        type: "success",
                      });
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
                        notes: movementData.notes,
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
                      logger.error("Error al actualizar datos después del movimiento:", refreshError);
                    }
                    if (refreshFailed) {
                      toast.show({
                        message:
                          "El movimiento se guardó, pero no se pudieron actualizar los datos de la pantalla.",
                        type: "info",
                      });
                    } else {
                      toast.show({
                        message: "El movimiento se registró correctamente.",
                        type: "success",
                      });
                    }
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

            <View className="mb-2 mt-2 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-text dark:text-text-dark">
                Estado del tanque
              </Text>
              {isSavingStatus && (
                <Text className="text-xs text-textSecondary dark:text-textSecondary-dark">
                  Guardando...
                </Text>
              )}
            </View>
            <TankStatusPicker
              value={status}
              onChange={(nextStatus) => void handleStatusChange(nextStatus)}
              disabled={isSavingStatus}
            />

            <Text className="mb-2 mt-4 text-base font-semibold text-text dark:text-text-dark">
              Accesos rápidos
            </Text>
            <View className="mb-2 flex-row gap-2">
              <TouchableOpacity
                accessibilityRole="button"
                className="min-h-[76px] flex-1 items-center justify-center rounded-xl border border-border bg-backgroundElement px-2 py-3 dark:border-border-dark dark:bg-backgroundElement-dark"
                onPress={() => router.push(`/tanks/${id}/batches`)}
              >
                <MaterialCommunityIcons
                  name="format-list-bulleted"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text className="mt-1 text-center text-xs font-semibold text-text dark:text-text-dark">
                  Lotes ({tankBatches.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                className="min-h-[76px] flex-1 items-center justify-center rounded-xl border border-border bg-backgroundElement px-2 py-3 dark:border-border-dark dark:bg-backgroundElement-dark"
                onPress={() =>
                  router.push({
                    pathname: "/tanks/[id]/map",
                    params: { id: String(currentTank.id) },
                  })
                }
              >
                <MaterialCommunityIcons
                  name="map-marker-path"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text className="mt-1 text-center text-xs font-semibold text-text dark:text-text-dark">
                  Mapa
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mb-4 mt-1 flex-row gap-2">
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ expanded: showHistory }}
                className="flex-1 flex-row items-center justify-center rounded-lg border border-border bg-backgroundElement px-3 py-3 dark:border-border-dark dark:bg-backgroundElement-dark"
                onPress={() => setShowHistory((visible) => !visible)}
              >
                <MaterialCommunityIcons
                  name={showHistory ? "chevron-up" : "history"}
                  size={20}
                  color={showHistory ? theme.text : theme.textSecondary}
                />
                <Text className="ml-2 font-semibold text-text dark:text-text-dark">
                  {showHistory ? "Ocultar historial" : "Ver historial"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                className="flex-1 flex-row items-center justify-center rounded-lg border border-border bg-backgroundElement px-3 py-3 dark:border-border-dark dark:bg-backgroundElement-dark"
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text className="ml-2 font-semibold text-text dark:text-text-dark">
                  {selectedDate.toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {showHistory && (
              <>
                <Text className="mb-2 mt-1 text-base font-semibold text-text dark:text-text-dark">
                  Historial de movimientos
                </Text>
                <View className="mb-5">
                  {isMovementLoading ? (
                    <ActivityIndicator
                      className="py-6"
                      size="small"
                      color={theme.text}
                    />
                  ) : selectedDateMovements.length === 0 ? (
                    <Text className="text-textSecondary dark:text-textSecondary-dark text-center py-6">
                      No hay movimientos registrados este día.
                    </Text>
                  ) : (
                    selectedDateMovements.map((movement, index) => (
                      <View key={movement.id} className="flex-row">
                        <View className="mr-3 w-8 items-center">
                          <View className="w-8 h-8 rounded-full bg-backgroundElement dark:bg-backgroundElement-dark items-center justify-center">
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
                                  ? theme.success
                                  : movement.movementType === MovementType.SALE
                                  ? theme.info
                                  : theme.danger
                              }
                            />
                          </View>
                          {index < selectedDateMovements.length - 1 && (
                            <View className="flex-1 w-px bg-backgroundSelected dark:bg-backgroundSelected-dark" />
                          )}
                        </View>
                        <View className="flex-1 pb-5">
                          <Text className="mb-1 text-xs text-textSecondary dark:text-textSecondary-dark">
                            {new Date(movement.movementDate).toLocaleString("es-MX")}
                          </Text>
                          <View className="rounded-xl border border-border bg-backgroundElement p-3 dark:border-border-dark dark:bg-backgroundElement-dark">
                            <View className="flex-row items-center justify-between">
                              <Text className="text-text dark:text-text-dark font-semibold">
                                {getMovementLabel(movement)}
                              </Text>
                              <Text className="text-text dark:text-text-dark font-bold">
                                {movement.quantity} piezas
                              </Text>
                            </View>
                            <Text className="text-textSecondary dark:text-textSecondary-dark mt-1">
                              {getMovementDescription(movement)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </>
            )}
          </View>

          <Button
            title="Eliminar tanque"
            variant="dangerOutline"
            onPress={confirmDeleteTank}
            loading={isDeleting}
            className="mb-2 mt-3"
            icon={
              !isDeleting ? (
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={18}
                  color={theme.danger}
                />
              ) : undefined
            }
          />
        </View>
      </ScreenLayout>

      <DayPickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        movementDates={movementDates}
        onDateChange={(date) => {
          hasPickedDate.current = true;
          setSelectedDate(date);
        }}
        onClose={() => setShowDatePicker(false)}
      />
    </>
  );
}
