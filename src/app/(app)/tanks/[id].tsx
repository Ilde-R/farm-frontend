import TankCard from "@/components/tank-card";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
    useAnimatedProps,
    useFrameCallback,
    useSharedValue,
} from "react-native-reanimated";
import Svg, { Line, Polyline } from "react-native-svg";

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

type TankPosition = {
    x: number;
    y: number;
    width: number;
    height: number;
}

type CirclePoint = {
    x: number;
    y: number;
}

type TankData = {
    id: number;
    piezas: number;
}

type TankConnection = {
    fromId: number;
    toId: number;
    fromPoint: CirclePoint;
    toPoint: CirclePoint;
    direction: FlowDirection;
}

type FlowDirection = "entrada" | "salida";

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

function getCircleBorderPoint(position: TankPosition, point: CirclePoint) {
    const centerX = position.x + position.width / 2;
    const centerY = position.y + position.height / 2;
    const pointLength = Math.hypot(point.x, point.y);
    const radius = Math.min(position.width, position.height) / 2;

    if (pointLength === 0) {
        return { x: centerX, y: centerY };
    }

    return {
        x: centerX + (point.x / pointLength) * radius,
        y: centerY + (point.y / pointLength) * radius,
    };
}

function getManualLinePoints(
    from: TankPosition,
    to: TankPosition,
    fromPoint: CirclePoint,
    toPoint: CirclePoint,
) {
    const fromBorderPoint = getCircleBorderPoint(from, fromPoint);
    const toBorderPoint = getCircleBorderPoint(to, toPoint);

    return {
        x1: fromBorderPoint.x,
        y1: fromBorderPoint.y,
        x2: toBorderPoint.x,
        y2: toBorderPoint.y,
    };
}

function getBranchLinePoints(
    to: TankPosition,
    toPoint: CirclePoint,
    centralX: number,
) {
    const end = getCircleBorderPoint(to, toPoint);
    const centerY = to.y + to.height / 2;

    return `${centralX},${centerY} ${end.x},${end.y}`;
}

export default function TankMapDetailScreen() {
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
        <View className="flex-1 bg-background p-6">
            <View className="items-center">
                <TankCard numero={1} piezas={100}/>
            </View>

            <View className="flex-row gap-4">
                {(["entrada", "salida"] as const).map((direction) => {
                    const isSelected = flowDirection === direction;

                    return (
                        <Pressable
                            key={direction}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            className={`rounded-lg border px-4 py-2 ${
                                isSelected
                                    ? "border-cyan-700 bg-cyan-700"
                                    : "border-cyan-700 bg-transparent"
                            }`}
                            onPress={() => toggleFlowDirection(direction)}
                        >
                            <Text className={isSelected ? "font-semibold text-white" : "font-semibold text-cyan-700"}>
                                {direction === "entrada" ? "Entrada" : "Salida"}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
           <View className="flex-1 bg-background">
        {flowDirection && visibleConnections.every(
            ({ fromId, toId }) =>
                tankPositions[fromId] &&
                tankPositions[toId],
        ) && (
            <Svg
                pointerEvents="none"
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                }}
            >
            {(() => {
                const sourcePosition = tankPositions[1];
                const centralReferencePosition = tankPositions[4];
                const sourcePoint = getCircleBorderPoint(sourcePosition, { x: 1, y: 0 });
                const centralX = (
                    sourcePoint.x +
                    getCircleBorderPoint(centralReferencePosition, { x: -1, y: 0 }).x
                ) / 2;
                const lastConnectionY = Math.max(
                    ...centralConnections.map(({ toId }) => {
                        const position = tankPositions[toId];
                        return position.y + position.height / 2;
                    }),
                );

                return [
                    <Line
                        key="central-route-entry"
                        x1={sourcePoint.x}
                        y1={sourcePoint.y}
                        x2={centralX}
                        y2={sourcePoint.y}
                        stroke="#0891b2"
                        strokeWidth={4}
                    />,
                    <AnimatedLine
                        key="central-route-entry-flow"
                        animatedProps={animatedFlowProps}
                        x1={sourcePoint.x}
                        y1={sourcePoint.y}
                        x2={centralX}
                        y2={sourcePoint.y}
                        stroke="#67e8f9"
                        strokeWidth={3}
                        strokeDasharray="4 16"
                        strokeLinecap="round"
                    />,
                    <Line
                        key="central-route"
                        x1={centralX}
                        y1={sourcePoint.y}
                        x2={centralX}
                        y2={lastConnectionY}
                        stroke="#0891b2"
                        strokeWidth={4}
                    />,
                    <AnimatedLine
                        key="central-route-flow"
                        animatedProps={animatedFlowProps}
                        x1={centralX}
                        y1={sourcePoint.y}
                        x2={centralX}
                        y2={lastConnectionY}
                        stroke="#67e8f9"
                        strokeWidth={3}
                        strokeDasharray="4 16"
                        strokeLinecap="round"
                    />,
                    ...visibleConnections.map(({ fromId, toId, fromPoint, toPoint }) => {
                const fromPosition = tankPositions[fromId];
                const toPosition = tankPositions[toId];
                if (toId !== 2) {
                    const points = getBranchLinePoints(toPosition, toPoint, centralX);

                    return [
                        <Polyline
                            key={`${fromId}-${toId}-base`}
                            points={points}
                            fill="none"
                            stroke="#0891b2"
                            strokeWidth={4}
                        />,
                        <AnimatedPolyline
                            key={`${fromId}-${toId}-flow`}
                            animatedProps={animatedFlowProps}
                            points={points}
                            fill="none"
                            stroke="#67e8f9"
                            strokeWidth={3}
                            strokeDasharray="4 16"
                            strokeLinecap="round"
                        />,
                    ];
                }

                const linePoints = getManualLinePoints(
                    fromPosition,
                    toPosition,
                    fromPoint,
                    toPoint,
                );

                return [
                    <Line
                        key={`${fromId}-${toId}-base`}
                        {...linePoints}
                        stroke="#0891b2"
                        strokeWidth={4}
                    />,
                    <AnimatedLine
                        key={`${fromId}-${toId}-flow`}
                        animatedProps={animatedFlowProps}
                        {...linePoints}
                        stroke="#67e8f9"
                        strokeWidth={3}
                        strokeDasharray="4 16"
                        strokeLinecap="round"
                    />,
                ];
                    })
                ];
            })()}
            </Svg>
        )}

        <View className="flex-row flex-wrap justify-between gap-y-8">
            {mockTanks.map((tank) => (
                <View
                    key={tank.id}
                    className="h-40 w-40"
                    onLayout={setTankPosition(tank.id)}
                >
                    {(!flowDirection || visibleTankIds.has(tank.id)) && (
                        <TankCard numero={tank.id} piezas={tank.piezas} showPiezas={false} />
                    )}
                    {tank.id !== 1 && (!flowDirection || visibleTankIds.has(tank.id)) && (
                        <Text className="absolute -bottom-7 w-full text-center text-xs font-bold text-cyan-700">
                            T{tank.id}: {tank.piezas}
                        </Text>
                    )}
                </View>
            ))}
        </View>

    </View>
        </View>
    );
}
