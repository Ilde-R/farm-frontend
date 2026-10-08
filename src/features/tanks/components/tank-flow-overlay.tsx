import Svg, { G, Line, Polyline } from "react-native-svg";
import Animated from "react-native-reanimated";
import { getCircleBorderPoint } from "../utils/tank-geometry";
import type { TankPosition } from "../types/tank";

type FlowDirection = "ingreso" | "salida";

export type TankConnection = {
    fromId: number;
    toId: number;
    direction: FlowDirection;
};

type TankFlowOverlayProps = {
    tankPositions: Record<number, TankPosition>;
    visibleConnections: TankConnection[];
    animatedFlowProps: object;
    animatedTrunkFlowProps: object;
    animatedUpperSpineFlowProps: object;
    animatedLowerSpineFlowProps: object;
};

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

export default function TankFlowOverlay({
    tankPositions,
    visibleConnections,
    animatedFlowProps,
    animatedTrunkFlowProps,
    animatedUpperSpineFlowProps,
    animatedLowerSpineFlowProps,
}: TankFlowOverlayProps) {
    const readyConnections = visibleConnections.filter(
        ({ fromId, toId }) => tankPositions[fromId] && tankPositions[toId],
    );

    if (readyConnections.length === 0) return null;

    const hubId = readyConnections[0].direction === "ingreso"
        ? readyConnections[0].toId
        : readyConnections[0].fromId;
    const hubPosition = tankPositions[hubId];
    const branches = readyConnections
        .filter((connection) => connection.fromId === hubId || connection.toId === hubId)
        .map((connection) => {
            const tankId = connection.fromId === hubId ? connection.toId : connection.fromId;
            return { connection, tankId, position: tankPositions[tankId] };
        })
        .filter((branch) => branch.position);

    if (!hubPosition || branches.length === 0) return null;

    const hubCenterX = hubPosition.x + hubPosition.width / 2;
    const hubCenterY = hubPosition.y + hubPosition.height / 2;
    const columns = Object.values(tankPositions)
        .map((position) => ({
            centerX: position.x + position.width / 2,
            left: position.x,
            right: position.x + position.width,
        }))
        .sort((first, second) => first.centerX - second.centerX)
        .reduce<{ centerX: number; left: number; right: number }[]>((result, position) => {
            const column = result.find(
                (candidate) => Math.abs(candidate.centerX - position.centerX) < 2,
            );
            if (column) {
                column.left = Math.min(column.left, position.left);
                column.right = Math.max(column.right, position.right);
            } else {
                result.push({ ...position });
            }
            return result;
        }, []);
    const centralX = columns.length > 1
        ? (columns[0].right + columns[1].left) / 2
        : branches.reduce(
              (total, branch) => total + branch.position.x + branch.position.width / 2,
              0,
          ) / branches.length;
    const hubPoint = getCircleBorderPoint(hubPosition, {
        x: centralX - hubCenterX,
        y: 0,
    });
    const firstBranchY = Math.min(
        hubCenterY,
        ...branches.map((branch) => branch.position.y + branch.position.height / 2),
    );
    const lastBranchY = Math.max(
        hubCenterY,
        ...branches.map((branch) => branch.position.y + branch.position.height / 2),
    );
    const hasUpperBranches = branches.some(
        (branch) => branch.position.y + branch.position.height / 2 < hubCenterY,
    );
    const hasLowerBranches = branches.some(
        (branch) => branch.position.y + branch.position.height / 2 > hubCenterY,
    );

    return (
        <Svg
            pointerEvents="none"
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        >
            <G>
                <Line
                    x1={hubPoint.x}
                    y1={hubPoint.y}
                    x2={centralX}
                    y2={hubCenterY}
                    stroke="#0891b2"
                    strokeWidth={4}
                />
                <AnimatedLine
                    animatedProps={animatedTrunkFlowProps}
                    x1={hubPoint.x}
                    y1={hubPoint.y}
                    x2={centralX}
                    y2={hubCenterY}
                    stroke="#67e8f9"
                    strokeWidth={3}
                    strokeDasharray="4 16"
                    strokeLinecap="round"
                />
                {hasUpperBranches && (
                    <>
                        <Line
                            x1={centralX}
                            y1={firstBranchY}
                            x2={centralX}
                            y2={hubCenterY}
                            stroke="#0891b2"
                            strokeWidth={4}
                        />
                        <AnimatedLine
                            animatedProps={animatedUpperSpineFlowProps}
                            x1={centralX}
                            y1={firstBranchY}
                            x2={centralX}
                            y2={hubCenterY}
                            stroke="#67e8f9"
                            strokeWidth={3}
                            strokeDasharray="4 16"
                            strokeLinecap="round"
                        />
                    </>
                )}
                {hasLowerBranches && (
                    <>
                        <Line
                            x1={centralX}
                            y1={hubCenterY}
                            x2={centralX}
                            y2={lastBranchY}
                            stroke="#0891b2"
                            strokeWidth={4}
                        />
                        <AnimatedLine
                            animatedProps={animatedLowerSpineFlowProps}
                            x1={centralX}
                            y1={hubCenterY}
                            x2={centralX}
                            y2={lastBranchY}
                            stroke="#67e8f9"
                            strokeWidth={3}
                            strokeDasharray="4 16"
                            strokeLinecap="round"
                        />
                    </>
                )}
                {branches.map(({ connection, tankId, position }) => {
                    const targetCenterX = position.x + position.width / 2;
                    const targetCenterY = position.y + position.height / 2;
                    const targetPoint = getCircleBorderPoint(position, {
                        x: centralX - targetCenterX,
                        y: 0,
                    });
                    const branchPoints = `${centralX},${targetCenterY} ${targetPoint.x},${targetPoint.y}`;

                    return (
                        <G key={`${connection.fromId}-${connection.toId}-${connection.direction}-${tankId}`}>
                            <Polyline
                                points={branchPoints}
                                fill="none"
                                stroke="#0891b2"
                                strokeWidth={4}
                            />
                            <AnimatedPolyline
                                animatedProps={animatedFlowProps}
                                points={branchPoints}
                                fill="none"
                                stroke="#67e8f9"
                                strokeWidth={3}
                                strokeDasharray="4 16"
                                strokeLinecap="round"
                            />
                        </G>
                    );
                })}
            </G>
        </Svg>
    );
}
