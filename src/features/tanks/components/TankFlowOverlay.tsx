import React from "react";
import Svg, { Line, Polyline } from "react-native-svg";
import Animated from "react-native-reanimated";

import { 
    getCircleBorderPoint, 
    getManualLinePoints, 
    getBranchLinePoints 
} from "../utils/tank-geometry";

type TankPosition = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type CirclePoint = {
    x: number;
    y: number;
};

type FlowDirection = "entrada" | "salida";

type TankConnection = {
    fromId: number;
    toId: number;
    fromPoint: CirclePoint;
    toPoint: CirclePoint;
    direction: FlowDirection;
};

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

type TankFlowOverlayProps = {
    tankPositions: Record<number, TankPosition>;
    visibleConnections: TankConnection[];
    centralConnections: TankConnection[];
    animatedFlowProps: any;
};

export default function TankFlowOverlay({ 
    tankPositions, 
    visibleConnections, 
    centralConnections, 
    animatedFlowProps 
}: TankFlowOverlayProps) {
    
    if (!visibleConnections.every(({ fromId, toId }) => tankPositions[fromId] && tankPositions[toId])) {
        return null;
    }

    const sourcePosition = tankPositions[1];
    const centralReferencePosition = tankPositions[4];
    
    if (!sourcePosition || !centralReferencePosition) return null;

    const sourcePoint = getCircleBorderPoint(sourcePosition, { x: 1, y: 0 });
    const centralX = (sourcePoint.x + getCircleBorderPoint(centralReferencePosition, { x: -1, y: 0 }).x) / 2;
    
    const lastConnectionY = Math.max(
        ...centralConnections.map(({ toId }) => {
            const position = tankPositions[toId];
            return position ? position.y + position.height / 2 : 0;
        })
    );

    return (
        <Svg 
            pointerEvents="none" 
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        >
            <Line 
                x1={sourcePoint.x} y1={sourcePoint.y} 
                x2={centralX} y2={sourcePoint.y} 
                stroke="#0891b2" strokeWidth={4} 
            />
            <AnimatedLine 
                animatedProps={animatedFlowProps} 
                x1={sourcePoint.x} y1={sourcePoint.y} 
                x2={centralX} y2={sourcePoint.y} 
                stroke="#67e8f9" strokeWidth={3} strokeDasharray="4 16" strokeLinecap="round" 
            />
            
            <Line 
                x1={centralX} y1={sourcePoint.y} 
                x2={centralX} y2={lastConnectionY} 
                stroke="#0891b2" strokeWidth={4} 
            />
            <AnimatedLine 
                animatedProps={animatedFlowProps} 
                x1={centralX} y1={sourcePoint.y} 
                x2={centralX} y2={lastConnectionY} 
                stroke="#67e8f9" strokeWidth={3} strokeDasharray="4 16" strokeLinecap="round" 
            />

            {visibleConnections.map(({ fromId, toId, fromPoint, toPoint }) => {
                const fromPosition = tankPositions[fromId];
                const toPosition = tankPositions[toId];
                
                if (toId !== 2) {
                    const points = getBranchLinePoints(toPosition, toPoint, centralX);
                    return (
                        <React.Fragment key={`${fromId}-${toId}-branch`}>
                            <Polyline 
                                points={points} 
                                fill="none" stroke="#0891b2" strokeWidth={4} 
                            />
                            <AnimatedPolyline 
                                animatedProps={animatedFlowProps} 
                                points={points} 
                                fill="none" stroke="#67e8f9" strokeWidth={3} strokeDasharray="4 16" strokeLinecap="round" 
                            />
                        </React.Fragment>
                    );
                }

                const linePoints = getManualLinePoints(fromPosition, toPosition, fromPoint, toPoint);
                return (
                    <React.Fragment key={`${fromId}-${toId}-manual`}>
                        <Line 
                            {...linePoints} 
                            stroke="#0891b2" strokeWidth={4} 
                        />
                        <AnimatedLine 
                            animatedProps={animatedFlowProps} 
                            {...linePoints} 
                            stroke="#67e8f9" strokeWidth={3} strokeDasharray="4 16" strokeLinecap="round" 
                        />
                    </React.Fragment>
                );
            })}
        </Svg>
    );
}