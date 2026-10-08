import ScreenLayout from "@/core/components/layout/ScreenLayout";
import { useBatch } from "@/features/batches/contexts/BatchContext";
import { getActiveBatchByTankId } from "@/features/batches/utils/batch.utils";
import { useTankMovement } from "@/features/tank-movements/contexts/TankMovementContext";
import TankCard, { getTankCardSize } from "@/features/tanks/components/tank-card";
import TankFlowOverlay, { type TankConnection } from "@/features/tanks/components/tank-flow-overlay";
import { useTank } from "@/features/tanks/contexts/TankContext";
import { TankStatus, type TankPosition } from "@/features/tanks/types/tank";
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

type FlowDirection = "entrada" | "salida";

export default function MapDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { width } = useWindowDimensions();
  const tankCardSize = getTankCardSize(width);
  const { tanks, fetchTanks } = useTank();
  const { batches, fetchBatches } = useBatch();
  const { tankMovements, isLoading, fetchTankMovements } = useTankMovement();
  const [tankPositions, setTankPositions] = useState<Record<number, TankPosition>>({});
  const [flowDirection, setFlowDirection] = useState<FlowDirection | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const flowOffset = useSharedValue(0);

  const currentTank = tanks.find((tank) => tank.id === id);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoadError(null);
      setTankPositions({});

      void Promise.all([
        fetchTanks(),
        fetchBatches(),
        id ? fetchTankMovements(id) : Promise.resolve(),
      ])
        .catch((error) => {
          if (isActive) {
            setLoadError(
              error instanceof Error
                ? error.message
                : "No se pudieron cargar los datos del mapa.",
            );
          }
        });

      return () => {
        isActive = false;
      };
    }, [fetchTanks, fetchBatches, fetchTankMovements, id]),
  );

  useFrameCallback(({ timeSincePreviousFrame }) => {
    const elapsedMilliseconds = timeSincePreviousFrame ?? 0;
    flowOffset.value = (flowOffset.value + elapsedMilliseconds * 0.009) % 20;
  });

  const animatedFlowProps = useAnimatedProps(() => ({
    strokeDashoffset: flowDirection === "entrada"
      ? flowOffset.value
      : -flowOffset.value,
  }));
  const animatedTrunkFlowProps = useAnimatedProps(() => ({
    strokeDashoffset: flowDirection === "entrada"
      ? flowOffset.value
      : -flowOffset.value,
  }));

  const allConnections: TankConnection[] = [
    ...(tankMovements?.incoming.fromTanks.map((group) => ({
        fromId: group.tankNumber,
        toId: tankMovements.tank.tankNumber,
        direction: "entrada" as const,
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
    strokeDashoffset: flowDirection === "entrada"
      ? -flowOffset.value
      : flowOffset.value,
  }));
  const animatedLowerSpineFlowProps = useAnimatedProps(() => ({
    strokeDashoffset: flowDirection === "entrada"
      ? flowOffset.value
      : -flowOffset.value,
  }));
  const visibleTankIds = new Set(
    visibleConnections.flatMap(({ fromId, toId }) => [fromId, toId]),
  );
  const quantityByTank = new Map<number, number>();
  if (flowDirection === "entrada" && tankMovements) {
    quantityByTank.set(
      tankMovements.tank.tankNumber,
      tankMovements.incoming.totalQuantity,
    );
    for (const group of tankMovements.incoming.fromTanks) {
      quantityByTank.set(group.tankNumber, group.quantity);
    }
  } else if (flowDirection === "salida" && tankMovements) {
    quantityByTank.set(
      tankMovements.tank.tankNumber,
      tankMovements.outgoing.totalQuantity,
    );
    for (const group of tankMovements.outgoing.toTanks) {
      quantityByTank.set(group.tankNumber, group.quantity);
    }
  }
  const activeBatchByTankId = getActiveBatchByTankId(batches);

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
      <View className="px-2 pb-10 pt-2">
        {currentTank && (
          <View className="mb-6 items-center">
            <TankCard
              size={tankCardSize}
              tankNumber={currentTank.tankNumber}
              tankStatus={currentTank.tankStatus}
              currentQuantity={activeBatchByTankId.get(currentTank.id)?.currentQuantity}
            />
          </View>
        )}

        <View className="mb-6 items-center">
          <View className="w-full max-w-[320px] flex-row rounded-2xl border border-white/10 bg-[#202a40] p-1.5">
            {(["entrada", "salida"] as const).map((direction) => {
              const isSelected = flowDirection === direction;
              return (
                <Pressable
                  key={direction}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl px-4 py-3 ${
                    isSelected ? "bg-cyan-700" : "bg-transparent"
                  }`}
                  onPress={() =>
                    setFlowDirection((current) =>
                      current === direction ? null : direction,
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name={direction === "entrada" ? "arrow-down-left" : "arrow-up-right"}
                    size={18}
                    color={isSelected ? "#ffffff" : "#94a3b8"}
                  />
                  <Text className={`font-semibold ${isSelected ? "text-white" : "text-slate-400"}`}>
                    {direction === "entrada" ? "Entrada" : "Salida"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {isLoading && (
          <ActivityIndicator className="mb-5" size="large" color="#67e8f9" />
        )}

        {loadError && (
          <View className="mb-5 flex-row items-center justify-center">
            <Text className="text-center text-red-400">{loadError}</Text>
            <Pressable
              className="ml-3"
              onPress={() => {
                if (id) void fetchTankMovements(id).catch((error) =>
                  Alert.alert(
                    "Error",
                    error instanceof Error ? error.message : "No se pudieron cargar los movimientos.",
                  ),
                );
              }}
            >
              <Text className="font-semibold text-cyan-300">Reintentar</Text>
            </Pressable>
          </View>
        )}

        {!isLoading && !loadError && flowDirection && visibleConnections.length === 0 && (
          <Text className="mb-5 text-center text-textSecondary dark:text-textSecondary-dark">
            {`No hay transferencias de ${flowDirection} para este tanque.`}
          </Text>
        )}

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
              const isVisible =
                !flowDirection ||
                tank.id === id ||
                visibleTankIds.has(tank.tankNumber);
              const isSelectedTank = tank.id === id;
              const movementLabel =
                flowDirection === "entrada"
                  ? isSelectedTank
                    ? "Ingresaron"
                    : "Salieron"
                  : isSelectedTank
                    ? "Salieron"
                    : "Ingresaron";
              return (
                <View
                  key={tank.id}
                  style={{ width: tankCardSize, height: tankCardSize }}
                  onLayout={setTankPosition(tank.tankNumber)}
                >
                  {isVisible && (
                    <>
                      <TankCard
                        size={tankCardSize}
                        tankNumber={tank.tankNumber}
                        tankStatus={tank.tankStatus ?? TankStatus.EMPTY}
                        currentQuantity={activeBatchByTankId.get(tank.id)?.currentQuantity}
                      />
                      {flowDirection && quantityByTank.has(tank.tankNumber) && (
                        <Text className="absolute -bottom-7 w-full text-center text-xs font-semibold text-cyan-200">
                          {movementLabel}: {quantityByTank.get(tank.tankNumber)} piezas
                        </Text>
                      )}
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}
