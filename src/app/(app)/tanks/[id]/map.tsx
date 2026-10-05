import ScreenLayout from "@/core/components/layout/ScreenLayout";
import TankCard, { getTankCardSize } from "@/features/tanks/components/tank-card";
import TankFlowOverlay from "@/features/tanks/components/tank-flow-overlay";
import { TankPosition, TankStatus } from "@/features/tanks/types/tank";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import {
  useAnimatedProps,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

type CirclePoint = { x: number; y: number; };
type TankData = { id: number; piezas: number; };
type FlowDirection = "entrada" | "salida";

export type TankConnection = {
  fromId: number;
  toId: number;
  fromPoint: CirclePoint;
  toPoint: CirclePoint;
  direction: FlowDirection;
};

const mockTanks: TankData[] = [
  { id: 1, piezas: 100 },
  { id: 2, piezas: 100 },
  { id: 3, piezas: 100 },
  { id: 4, piezas: 100 },
  { id: 5, piezas: 100 },
  { id: 6, piezas: 100 },
  { id: 7, piezas: 100 },
  { id: 8, piezas: 100 },
];

const mockConnections: TankConnection[] = [
  { fromId: 1, toId: 2, fromPoint: { x: 1, y: 0 }, toPoint: { x: -1, y: 0 }, direction: "entrada" },
  { fromId: 1, toId: 3, fromPoint: { x: 1, y: 0 }, toPoint: { x: 1, y: 0 }, direction: "entrada" },
  { fromId: 1, toId: 6, fromPoint: { x: 1, y: 0 }, toPoint: { x: -1, y: 0 }, direction: "entrada" },
  { fromId: 1, toId: 7, fromPoint: { x: 1, y: 0 }, toPoint: { x: 1, y: 0 }, direction: "entrada" },
  { fromId: 1, toId: 8, fromPoint: { x: 1, y: 0 }, toPoint: { x: -1, y: 0 }, direction: "entrada" },
  { fromId: 1, toId: 4, fromPoint: { x: 1, y: 0 }, toPoint: { x: -1, y: 0 }, direction: "salida" },
  { fromId: 1, toId: 5, fromPoint: { x: 1, y: 0 }, toPoint: { x: 1, y: 0 }, direction: "salida" },
];

export default function MapDetailScreen() {
  const { width } = useWindowDimensions();
  const tankCardSize = getTankCardSize(width);
  const [tankPositions, setTankPositions] = useState<Record<number, TankPosition>>({});
  const [flowDirection, setFlowDirection] = useState<FlowDirection | null>(null);
  const flowOffset = useSharedValue(0);

  useFrameCallback(({ timeSincePreviousFrame }) => {
    const elapsedMilliseconds = timeSincePreviousFrame ?? 0;
    flowOffset.value = (flowOffset.value + elapsedMilliseconds * 0.009) % 20;
  });

  const animatedFlowProps = useAnimatedProps(() => ({
    strokeDashoffset: flowDirection === "entrada"
      ? flowOffset.value
      : -flowOffset.value,
  }));

  const toggleFlowDirection = (direction: FlowDirection) => {
    setFlowDirection((currentDirection) =>
      currentDirection === direction ? null : direction,
    );
  };

  const visibleConnections = flowDirection
    ? mockConnections.filter(({ direction }) => direction === flowDirection)
    : [];
    
  const centralConnections = visibleConnections.filter(({ toId }) => toId !== 2);
  
  const visibleTankIds = new Set(
    visibleConnections.flatMap(({ fromId, toId }) => [fromId, toId]),
  );

  const setTankPosition = (tankId: number) => ({ nativeEvent }: { nativeEvent: { layout: TankPosition } }) => {
    setTankPositions((currentPositions) => ({
      ...currentPositions,
      [tankId]: nativeEvent.layout,
    }));
  };

  return (
    <ScreenLayout 
      title="Mapa de traslados" 
      showBackButton={true} 
      isScrollable={true}
    >
      <View className="px-2 pt-2 pb-10">
        
        <View className="items-center mb-6">
          <TankCard
            size={tankCardSize}
            tankNumber={1}
            tankStatus={TankStatus.ACTIVE}
          />
        </View>

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
                  onPress={() => toggleFlowDirection(direction)}
                >
                  <MaterialCommunityIcons
                    name={direction === "entrada" ? "arrow-down-left" : "arrow-up-right"}
                    size={18}
                    color={isSelected ? "#ffffff" : "#94a3b8"}
                  />
                  <Text
                    className={`font-semibold ${
                      isSelected ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {direction === "entrada" ? "Entrada" : "Salida"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        
        <View className="relative">
          {flowDirection && (
            <TankFlowOverlay
              tankPositions={tankPositions}
              visibleConnections={visibleConnections}
              centralConnections={centralConnections}
              animatedFlowProps={animatedFlowProps}
            />
          )}

          <View className="flex-row flex-wrap justify-between gap-y-12">
            {mockTanks.map((tank) => (
              <View
                key={tank.id}
                style={{ width: tankCardSize, height: tankCardSize }}
                onLayout={setTankPosition(tank.id)}
              >
                {(!flowDirection || visibleTankIds.has(tank.id)) && (
                  <TankCard
                    size={tankCardSize}
                    tankNumber={tank.id}
                    tankStatus={TankStatus.ACTIVE}
                  />
                )}
                
                {tank.id !== 1 && (!flowDirection || visibleTankIds.has(tank.id)) && (
                  <Text className="absolute w-full text-xs font-bold text-center -bottom-7 text-cyan-700">
                    T{tank.id}: {tank.piezas}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

      </View>
    </ScreenLayout>
  );
}