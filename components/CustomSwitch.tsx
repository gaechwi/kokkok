import colors from "@/constants/colors";
import { TouchableWithoutFeedback } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface SwitchProps {
  value: SharedValue<boolean>;
  onPress: () => void;
  duration?: number;
  size?: {
    width: number;
    height: number;
    padding: number;
  };
  trackColors?: { on: string; off: string };
}

export default function CustomSwitch({
  value,
  onPress,
  duration = 250,
  size = { width: 45, height: 22, padding: 3 },
  trackColors = { on: colors.primary, off: colors.gray[25] },
}: SwitchProps) {
  const thumbSize = size.height - 2 * size.padding;

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      Number(value.value),
      [0, 1],
      [trackColors.off, trackColors.on],
    );
    const colorValue = withTiming(color, { duration });

    return {
      backgroundColor: colorValue,
      borderRadius: size.height / 2,
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(
      Number(value.value),
      [0, 1],
      [0, size.width - size.height],
    );
    const translateValue = withTiming(moveValue, { duration });

    return {
      transform: [{ translateX: translateValue }],
      borderRadius: size.height / 2,
    };
  });

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View style={[trackAnimatedStyle, size]}>
        <Animated.View
          className="bg-white"
          style={[thumbAnimatedStyle, { width: thumbSize, height: thumbSize }]}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
