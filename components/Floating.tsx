import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface FloatingProps {
  duration?: number;
  isActive?: boolean;
}

type FloatingViewProps = FloatingProps &
  React.ComponentProps<typeof Animated.View>;

export function FloatingView({
  duration = 1000,
  isActive = false,
  style,
  children,
  ...rest
}: FloatingViewProps) {
  const textOffset = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      textOffset.value = withTiming(0, { duration });
      opacity.value = withTiming(1, { duration });
    }
  }, [isActive, textOffset, opacity, duration]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textOffset.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[floatingStyle, style]} {...rest}>
      {children}
    </Animated.View>
  );
}

type FloatingTextProps = FloatingProps &
  React.ComponentProps<typeof Animated.Text>;

export function FloatingText({
  duration = 1000,
  isActive = false,
  style,
  children,
  ...rest
}: FloatingTextProps) {
  const textOffset = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      textOffset.value = withTiming(0, { duration });
      opacity.value = withTiming(1, { duration });
    }
  }, [isActive, textOffset, opacity, duration]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textOffset.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[floatingStyle, style]} {...rest}>
      {children}
    </Animated.Text>
  );
}
