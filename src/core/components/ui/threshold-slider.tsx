import { useTheme } from "@/core/theme/use-theme";
import { useCallback, useRef } from "react";
import { PanResponder, View } from "react-native";

interface ThresholdSliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  onComplete?: (value: number) => void;
}

export default function ThresholdSlider({
  value,
  min = 0,
  max = 10,
  onChange,
  onComplete,
}: ThresholdSliderProps) {
  const theme = useTheme();
  const trackLayout = useRef({ x: 0, width: 0 });
  const latestValue = useRef(value);
  latestValue.current = value;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clampAndRound = useCallback(
    (pageX: number) => {
      const { x, width } = trackLayout.current;
      if (width <= 0) return latestValue.current;
      const ratio = Math.min(Math.max((pageX - x) / width, 0), 1);
      const raw = min + ratio * (max - min);
      return Math.round(raw * 10) / 10;
    },
    [min, max],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        trackRef.current?.measureInWindow((x, _y, width) => {
          trackLayout.current = { x, width };
          const v = clampAndRound(e.nativeEvent.pageX);
          latestValue.current = v;
          onChangeRef.current(v);
        });
      },
      onPanResponderMove: (_e, gestureState) => {
        const { x, width } = trackLayout.current;
        if (width <= 0) return;
        const v = clampAndRound(gestureState.moveX);
        latestValue.current = v;
        onChangeRef.current(v);
      },
      onPanResponderRelease: () => {
        onCompleteRef.current?.(latestValue.current);
      },
      onPanResponderTerminate: () => {
        onCompleteRef.current?.(latestValue.current);
      },
    }),
  ).current;

  const trackRef = useRef<View>(null);

  const pct = Math.min(
    Math.max(((value - min) / (max - min)) * 100, 0),
    100,
  );

  return (
    <View
      ref={trackRef}
      onLayout={() => {
        trackRef.current?.measureInWindow((x, _y, width) => {
          trackLayout.current = { x, width };
        });
      }}
      className="h-8 justify-center"
      {...panResponder.panHandlers}
    >
      <View className="h-3 overflow-hidden rounded-full bg-backgroundSelected dark:bg-backgroundSelected-dark">
        <View
          style={{ width: `${pct}%` }}
          className="h-full rounded-full bg-primary"
        />
      </View>
      <View
        style={{
          position: "absolute",
          left: `${pct}%`,
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: "white",
          marginLeft: -12,
          borderWidth: 1.5,
          borderColor: theme.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 4,
        }}
      />
    </View>
  );
}
