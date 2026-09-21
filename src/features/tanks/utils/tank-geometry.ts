import { CirclePoint, TankPosition } from "../types/tank";

export function getCircleBorderPoint(position: TankPosition, point: CirclePoint) {
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

export function getManualLinePoints(
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

export function getBranchLinePoints(
    to: TankPosition,
    toPoint: CirclePoint,
    centralX: number,
) {
    const end = getCircleBorderPoint(to, toPoint);
    const centerY = to.y + to.height / 2;

    return `${centralX},${centerY} ${end.x},${end.y}`;
}