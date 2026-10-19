import { cn } from "@/core/utils/cn";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  className?: string;
  /** Inline style for cases Tailwind can't express (e.g. circular sizing). */
  style?: object;
}

/** Shimmering placeholder block for loading states. */
export default function Skeleton({ className, style }: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800 }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={cn(
        "rounded-lg bg-backgroundSelected dark:bg-backgroundSelected-dark",
        className,
      )}
    />
  );
}
