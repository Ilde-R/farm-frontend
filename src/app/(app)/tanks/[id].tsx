import TankCard from "@/components/tank-card";
import { useState } from "react";
import { Text, View } from "react-native";
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
    route?: "direct" | "orthogonal";
    bendReferenceId?: number;
}

const mockTanks: TankData[] = [
    { id: 1, piezas: 100 },
    { id: 2, piezas: 100 },
    { id: 3, piezas: 100 },
    { id: 4, piezas: 100 },
    { id: 5, piezas: 100 },
    { id: 6, piezas: 100 },
];

const mockConnections: TankConnection[] = [
    { fromId: 1, toId: 2, fromPoint: { x: 1, y: 0 }, toPoint: { x: -1, y: 0 } },
    { fromId: 1, toId: 3, fromPoint: { x: 1, y: 0 }, toPoint: { x: 1, y: 0 }, route: "orthogonal", bendReferenceId: 4 },
    { fromId: 1, toId: 6, fromPoint: { x: 1, y: 0 }, toPoint: { x: -1, y: 0 }, route: "orthogonal", bendReferenceId: 4 },
];

const connectedTankIds = new Set(
    mockConnections.flatMap(({ fromId, toId }) => [fromId, toId]),
);

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

function getOrthogonalLinePoints(
    from: TankPosition,
    to: TankPosition,
    fromPoint: CirclePoint,
    toPoint: CirclePoint,
    bendX?: number,
) {
    const start = getCircleBorderPoint(from, fromPoint);
    const end = getCircleBorderPoint(to, toPoint);
    const middleX = bendX ?? ((start.x + end.x) / 2);

    return `${start.x},${start.y} ${middleX},${start.y} ${middleX},${end.y} ${end.x},${end.y}`;
}

export default function TankMapDetailScreen() {
    const [tankPositions, setTankPositions] = useState<Record<number, TankPosition>>({});
    const flowOffset = useSharedValue(0);

    useFrameCallback(({ timeSincePreviousFrame }) => {
        const elapsedMilliseconds = timeSincePreviousFrame ?? 0;
        flowOffset.value = (flowOffset.value + elapsedMilliseconds * 0.009) % 20;
    });

    const animatedFlowProps = useAnimatedProps(() => ({
        strokeDashoffset: flowOffset.value,
    }));

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
                <Text className="text-text dark:text-text-dark"> 
                    Entrada
                </Text>
                <Text className="text-text dark:text-text-dark"> 
                    Salida
                </Text>
            </View>
           <View className="flex-1 bg-background">
        {mockConnections.every(
            ({ fromId, toId, bendReferenceId }) =>
                tankPositions[fromId] &&
                tankPositions[toId] &&
                (!bendReferenceId || tankPositions[bendReferenceId]),
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
            {mockConnections.map(({ fromId, toId, fromPoint, toPoint, route, bendReferenceId }) => {
                const fromPosition = tankPositions[fromId];
                const toPosition = tankPositions[toId];
                const bendReferencePosition = bendReferenceId
                    ? tankPositions[bendReferenceId]
                    : undefined;
                const bendX = bendReferencePosition
                    ? (getCircleBorderPoint(fromPosition, fromPoint).x +
                        getCircleBorderPoint(bendReferencePosition, { x: -1, y: 0 }).x) / 2
                    : undefined;
                if (route === "orthogonal") {
                    const points = getOrthogonalLinePoints(
                        fromPosition,
                        toPosition,
                        fromPoint,
                        toPoint,
                        bendX,
                    );

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
            })}
            </Svg>
        )}

        <View className="flex-row flex-wrap justify-between gap-y-8">
            {mockTanks.map((tank) => (
                <View
                    key={tank.id}
                    className="w-40"
                    onLayout={setTankPosition(tank.id)}
                >
                    {connectedTankIds.has(tank.id) && (
                        <TankCard numero={tank.id} piezas={tank.piezas} showPiezas={false} />
                    )}
                    {tank.id !== 1 && (
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
