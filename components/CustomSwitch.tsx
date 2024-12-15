import colors from "@/constants/colors";
import { TouchableWithoutFeedback } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface ToggleProps {
  value: SharedValue<boolean>;
  onPress?: () => void;
  duration?: number;
  trackColors?: { on: string; off: string };
}

export default function CustomSwitch({
  value,
  onPress,
  duration = 400,
  trackColors = { on: colors.primary, off: colors.gray[25] },
}: ToggleProps) {
  const height = useSharedValue(0);
  const width = useSharedValue(0);

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      Number(value.value),
      [0, 1],
      [trackColors.off, trackColors.on],
    );
    const colorValue = withTiming(color, { duration });

    return {
      backgroundColor: colorValue,
      borderRadius: height.value / 2,
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(
      Number(value.value),
      [0, 1],
      [0, width.value - height.value],
    );
    const translateValue = withTiming(moveValue, { duration });

    return {
      transform: [{ translateX: translateValue }],
      borderRadius: height.value / 2,
    };
  });

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
          width.value = e.nativeEvent.layout.width;
        }}
        className="w-[45px] h-[22px] p-[3px]"
        style={[trackAnimatedStyle]}
      >
        <Animated.View
          className="size-[16px] bg-white"
          style={[thumbAnimatedStyle]}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
