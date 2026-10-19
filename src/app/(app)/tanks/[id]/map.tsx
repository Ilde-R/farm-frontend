import ScreenLayout from "@/core/components/layout/ScreenLayout";
import Card from "@/core/components/ui/card";
import EmptyState from "@/core/components/ui/empty-state";
import { useTheme } from "@/core/theme/use-theme";
import { cn } from "@/core/utils/cn";
import { getErrorMessage } from "@/core/utils/errors";
import { useBatch } from "@/features/batches/contexts/BatchContext";
import { getActiveBatchByTankId } from "@/features/batches/utils/batch.utils";
import { useTankMovement } from "@/features/tank-movements/contexts/TankMovementContext";
import { MovementType } from "@/features/tank-movements/types/tank-movement";
import TankCard, { getTankCardSize } from "@/features/tanks/components/tank-card";
import TankFlowOverlay, {
  type TankConnection,
} from "@/features/tanks/components/tank-flow-overlay";
import { useTank } from "@/features/tanks/contexts/TankContext";
import { TANK_STATUS_LABELS } from "@/features/tanks/constants/tank.constants";
import { TankStatus, type TankPosition } from "@/features/tanks/types/tank";
import { getDaysInCulture } from "@/features/tanks/utils/tank-list";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  useAnimatedProps,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

type FlowDirection = "ingreso" | "salida";

const OTHER_MOVEMENT_LABELS: Record<string, string> = {
  [MovementType.SALE]: "Ventas",
  [MovementType.MORTALITY]: "Mortandad",
  [MovementType.TRANSFER]: "Transferencias",
};

function formatQuantity(value: number) {
  return value.toLocaleString("es-MX");
}

export default function MapDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const tankCardSize = getTankCardSize(width);
  const { tanks, fetchTanks } = useTank();
  const { batches, fetchBatches } = useBatch();
  const { tankMovements, isLoading, fetchTankMovements } = useTankMovement();
  const [tankPositions, setTankPositions] = useState<Record<number, TankPosition>>({});
  const [flowDirection, setFlowDirection] = useState<FlowDirection | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const flowOffset = useSharedValue(0);

  const currentTank = tanks.find((tank) => tank.id === id);

  const loadData = useCallback(() => {
    setLoadError(null);
    setTankPositions({});
    return Promise.all([
      fetchTanks(),
      fetchBatches(),
      id ? fetchTankMovements(id) : Promise.resolve(),
    ]);
  }, [fetchTanks, fetchBatches, fetchTankMovements, id]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void loadData().catch((error) => {
        if (isActive) {
          setLoadError(
            getErrorMessage(error, "No se pudieron cargar los datos del mapa."),
          );
        }
      });

      return () => {
        isActive = false;
      };
    }, [loadData]),
  );

  function handleRetry() {
    void loadData().catch((error) => {
      Alert.alert(
        "Error",
        getErrorMessage(error, "No se pudieron cargar los datos del mapa."),
      );
    });
  }

  useFrameCallback(({ timeSincePreviousFrame }) => {
    const elapsedMilliseconds = timeSincePreviousFrame ?? 0;
    flowOffset.value = (flowOffset.value + elapsedMilliseconds * 0.009) % 20;
  });

  const animatedFlowProps = useAnimatedProps(() => ({
    strokeDashoffset: flowDirection === "ingreso"
      ? flowOffset.value
      : -flowOffset.value,
  }));
  const animatedTrunkFlowProps = useAnimatedProps(() => ({
    strokeDashoffset: flowDirection === "ingreso"
      ? flowOffset.value
      : -flowOffset.value,
  }));

  const allConnections: TankConnection[] = [
    ...(tankMovements?.incoming.fromTanks.map((group) => ({
        fromId: group.tankNumber,
        toId: tankMovements.tank.tankNumber,
        direction: "ingreso" as const,
      })) ?? []),
    ...(tankMovements?.outgoing.toTanks.map((group) => ({
        fromId: tankMovements.tank.tankNumber,
        toId: group.tankNumber,
        direction: "salida" as const,
      })) ?? []),
  ];

  const visibleConnections = flowDirection
    ? allConnections.filter((connection) => connection.direction === flowDirection)
    : [];
  const animatedUpperSpineFlowProps = useAnimatedProps(() => ({
    strokeDashoffset: flowDirection === "ingreso"
      ? -flowOffset.value
      : flowOffset.value,
  }));
  const animatedLowerSpineFlowProps = useAnimatedProps(() => ({
    strokeDashoffset: flowDirection === "ingreso"
      ? flowOffset.value
      : -flowOffset.value,
  }));
  const visibleTankIds = new Set(
    visibleConnections.flatMap(({ fromId, toId }) => [fromId, toId]),
  );
  const quantityByTank = new Map<number, number>();
  if (flowDirection === "ingreso" && tankMovements) {
    if (tankMovements.incoming.fromTanks.length > 0) {
      quantityByTank.set(
        tankMovements.tank.tankNumber,
        tankMovements.incoming.totalQuantity,
      );
    }
    for (const group of tankMovements.incoming.fromTanks) {
      quantityByTank.set(group.tankNumber, group.quantity);
    }
  } else if (flowDirection === "salida" && tankMovements) {
    if (tankMovements.outgoing.toTanks.length > 0) {
      quantityByTank.set(
        tankMovements.tank.tankNumber,
        tankMovements.outgoing.toTanks.reduce(
          (total, group) => total + group.quantity,
          0,
        ),
      );
    }
    for (const group of tankMovements.outgoing.toTanks) {
      quantityByTank.set(group.tankNumber, group.quantity);
    }
  }
  const activeBatchByTankId = getActiveBatchByTankId(batches);

  const incomingGroups = tankMovements?.incoming.fromTanks ?? [];
  const outgoingGroups = tankMovements?.outgoing.toTanks ?? [];
  const otherMovements = tankMovements?.outgoing.otherMovements ?? [];
  const hasAnyMovement =
    incomingGroups.length > 0 ||
    outgoingGroups.length > 0 ||
    otherMovements.length > 0;

  const isIngreso = flowDirection === "ingreso";
  const selectedTotal = isIngreso
    ? tankMovements?.incoming.totalQuantity ?? 0
    : outgoingGroups.reduce((total, group) => total + group.quantity, 0);
  const selectedTankCount = isIngreso
    ? incomingGroups.length
    : outgoingGroups.length;
  const hasDirectionData = isIngreso
    ? incomingGroups.length > 0
    : outgoingGroups.length > 0 || otherMovements.length > 0;

  const hasIngreso = incomingGroups.length > 0;
  const hasSalida = outgoingGroups.length > 0 || otherMovements.length > 0;
  const currentDaysInCulture = getDaysInCulture(
    currentTank ? activeBatchByTankId.get(currentTank.id)?.stockingDate : null,
  );
  const currentQuantity = currentTank
    ? activeBatchByTankId.get(currentTank.id)?.currentQuantity
    : undefined;
  const hasNoTanks = !isLoading && !loadError && tanks.length === 0;

  const setTankPosition =
    (tankNumber: number) =>
    ({ nativeEvent }: { nativeEvent: { layout: TankPosition } }) => {
      setTankPositions((positions) => ({
        ...positions,
        [tankNumber]: nativeEvent.layout,
      }));
    };

  return (
    <ScreenLayout
      title="Mapa de traslados"
      showBackButton
      isScrollable
    >
      <View className="pb-10 pt-2">
        {hasNoTanks && (
          <EmptyState
            icon="water-off"
            title="No hay tanques registrados"
            description="Registra un tanque para ver aquí su mapa de traslados."
          />
        )}

        {currentTank && (
          <Card className="mb-4 items-center">
            <View className="h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <MaterialCommunityIcons name="water" size={24} color={theme.primary} />
            </View>
            <Text className="mt-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-textSecondary dark:text-textSecondary-dark">
              Tanque actual
            </Text>
            <View className="mt-0.5 flex-row items-baseline justify-center">
              <Text className="text-xl font-bold text-text dark:text-text-dark">
                Tanque {currentTank.tankNumber}
              </Text>
              <Text className="ml-2 text-xs font-medium text-textSecondary dark:text-textSecondary-dark">
                {TANK_STATUS_LABELS[currentTank.tankStatus as TankStatus] ??
                  String(currentTank.tankStatus)}
              </Text>
            </View>
            <Text className="mt-0.5 text-center text-xs text-textSecondary dark:text-textSecondary-dark">
              {currentQuantity !== undefined
                ? `${formatQuantity(currentQuantity)} piezas`
                : "Sin lote activo"}
              {currentDaysInCulture !== null
                ? ` · ${currentDaysInCulture} ${currentDaysInCulture === 1 ? "día" : "días"} de cultivo`
                : ""}
            </Text>
          </Card>
        )}

        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-center gap-3">
            <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-textSecondary dark:text-textSecondary-dark">
              Ver traslados
            </Text>
            {flowDirection && (
              <Pressable accessibilityRole="button" onPress={() => setFlowDirection(null)}>
                <Text className="text-xs font-semibold text-primary dark:text-primary-dark">
                  Limpiar
                </Text>
              </Pressable>
            )}
          </View>

          <View className="flex-row gap-2">
            {(["ingreso", "salida"] as const).map((direction) => {
              const isSelected = flowDirection === direction;
              const isEnabled = direction === "ingreso" ? hasIngreso : hasSalida;
              const count =
                direction === "ingreso" ? incomingGroups.length : outgoingGroups.length;
              const icon = direction === "ingreso" ? "arrow-down-left" : "arrow-up-right";
              const label = direction === "ingreso" ? "Ingreso" : "Salida";

              return (
                <Pressable
                  key={direction}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected, disabled: !isEnabled }}
                  disabled={!isEnabled}
                  className={cn(
                    "flex-1 flex-row items-center justify-center gap-2 rounded-xl border px-4 py-3",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-border bg-backgroundElement dark:border-border-dark dark:bg-backgroundElement-dark",
                    !isEnabled && "opacity-40",
                  )}
                  onPress={() => setFlowDirection(isSelected ? null : direction)}
                >
                  <MaterialCommunityIcons
                    name={icon}
                    size={18}
                    color={isSelected ? theme.primaryForeground : theme.textSecondary}
                  />
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      isSelected
                        ? "text-primaryForeground"
                        : "text-textSecondary dark:text-textSecondary-dark",
                    )}
                  >
                    {label}
                  </Text>
                  {count > 0 && (
                    <View
                      className={cn(
                        "rounded-full px-1.5 py-0.5",
                        isSelected ? "bg-primaryForeground/25" : "bg-textTertiary/15",
                      )}
                    >
                      <Text
                        className={cn(
                          "text-[10px] font-bold",
                          isSelected
                            ? "text-primaryForeground"
                            : "text-textSecondary dark:text-textSecondary-dark",
                        )}
                      >
                        {count}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {isLoading && (
          <ActivityIndicator className="mb-5" size="large" color={theme.primary} />
        )}

        {loadError && (
          <View className="mb-5 flex-row items-center justify-center">
            <Text className="text-center text-danger dark:text-danger-dark">
              {loadError}
            </Text>
            <Pressable className="ml-3" onPress={handleRetry}>
              <Text className="font-semibold text-primary dark:text-primary-dark">
                Reintentar
              </Text>
            </Pressable>
          </View>
        )}

        {!isLoading && !loadError && !hasAnyMovement && (
          <EmptyState
            icon="swap-horizontal"
            title="Sin traslados registrados"
            description="Este tanque todavía no tiene transferencias ni movimientos."
            className="py-8"
          />
        )}

        {!isLoading && !loadError && hasAnyMovement && !flowDirection && (
          <View className="mb-4 flex-row items-center justify-center rounded-xl border border-border bg-backgroundElement px-3 py-2.5 dark:border-border-dark dark:bg-backgroundElement-dark">
            <MaterialCommunityIcons
              name="gesture-tap"
              size={16}
              color={theme.textTertiary}
            />
            <Text className="ml-2 text-center text-xs text-textSecondary dark:text-textSecondary-dark">
              Selecciona <Text className="font-semibold">Ingreso</Text> o{" "}
              <Text className="font-semibold">Salida</Text> para trazar el flujo.
            </Text>
          </View>
        )}

        {!isLoading && !loadError && flowDirection && !hasDirectionData && (
          <Text className="mb-5 text-center text-sm text-textSecondary dark:text-textSecondary-dark">
            {`No hay transferencias de ${isIngreso ? "entrada" : "salida"} para este tanque.`}
          </Text>
        )}

        {!isLoading && !loadError && flowDirection && hasDirectionData && (
          <Card className="mb-4 items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark/10">
              <MaterialCommunityIcons
                name={isIngreso ? "arrow-down-left" : "arrow-up-right"}
                size={22}
                color={theme.primary}
              />
            </View>
            <Text className="mt-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-textSecondary dark:text-textSecondary-dark">
              {isIngreso ? "Total ingresado" : "Total transferido"}
            </Text>
            <View className="mt-0.5 flex-row items-baseline justify-center">
              <Text className="text-2xl font-extrabold tracking-tight text-text dark:text-text-dark">
                {formatQuantity(selectedTotal)}
              </Text>
              <Text className="ml-1.5 text-sm font-medium text-textSecondary dark:text-textSecondary-dark">
                piezas
              </Text>
            </View>
            <Text className="mt-0.5 text-center text-xs text-textSecondary dark:text-textSecondary-dark">
              {selectedTankCount} {selectedTankCount === 1 ? "tanque" : "tanques"}
            </Text>

            {flowDirection === "salida" && otherMovements.length > 0 && (
              <View className="mt-4 w-full border-t border-border pt-3 dark:border-border-dark">
                <Text className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[1.5px] text-textSecondary dark:text-textSecondary-dark">
                  Otros movimientos
                </Text>
                <View className="flex-row flex-wrap justify-center gap-2">
                  {otherMovements.map((group) => (
                    <View
                      key={group.movementType}
                      className="flex-row items-center rounded-full bg-backgroundSelected px-3 py-1.5 dark:bg-backgroundSelected-dark"
                    >
                      <Text className="text-xs font-medium text-textSecondary dark:text-textSecondary-dark">
                        {OTHER_MOVEMENT_LABELS[group.movementType] ?? group.movementType}
                      </Text>
                      <Text className="ml-1.5 text-xs font-bold text-text dark:text-text-dark">
                        {formatQuantity(group.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>
        )}

        {visibleConnections.length > 0 && (
          <View className="mb-4 flex-row items-center justify-center gap-2">
            <View className="flex-row items-center gap-1.5">
              <View className="h-1 w-4 rounded-full bg-primary" />
              <Text className="text-xs text-textSecondary dark:text-textSecondary-dark">
                Ruta del flujo
              </Text>
            </View>
            <Text className="text-textTertiary dark:text-textTertiary-dark">·</Text>
            <Text className="text-xs text-textSecondary dark:text-textSecondary-dark">
              {isIngreso ? "entra al tanque actual" : "sale del tanque actual"}
            </Text>
          </View>
        )}

        {tanks.length > 0 && (
          <View className="relative">
            <TankFlowOverlay
              tankPositions={tankPositions}
              visibleConnections={visibleConnections}
              animatedFlowProps={animatedFlowProps}
              animatedTrunkFlowProps={animatedTrunkFlowProps}
              animatedUpperSpineFlowProps={animatedUpperSpineFlowProps}
              animatedLowerSpineFlowProps={animatedLowerSpineFlowProps}
            />

            <View className="flex-row flex-wrap justify-between gap-y-12">
              {tanks.map((tank) => {
                const isConnected =
                  !flowDirection ||
                  tank.id === id ||
                  visibleTankIds.has(tank.tankNumber);
                const isSelectedTank = tank.id === id;
                const quantity = quantityByTank.get(tank.tankNumber);
                return (
                  <View
                    key={tank.id}
                    style={{ width: tankCardSize, height: tankCardSize }}
                    onLayout={setTankPosition(tank.tankNumber)}
                    className={cn(
                      isConnected ? "opacity-100" : "opacity-30",
                    )}
                  >
                    <TankCard
                      size={tankCardSize}
                      highlighted={isSelectedTank}
                      shape="circle"
                      tankNumber={tank.tankNumber}
                      tankStatus={tank.tankStatus ?? TankStatus.EMPTY}
                      currentQuantity={activeBatchByTankId.get(tank.id)?.currentQuantity}
                    />
                    {flowDirection && quantity !== undefined && (
                      <Text className="absolute -bottom-6 w-full text-center text-[11px] font-semibold text-primary dark:text-primary-dark">
                        {formatQuantity(quantity)} pzs
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}
