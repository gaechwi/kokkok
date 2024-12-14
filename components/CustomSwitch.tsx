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
  isInit: SharedValue<boolean>;
  onPress: () => void;
  duration?: number;
  size?: {
    switchWidth: number;
    switchHeight: number;
    padding: number;
  };
  trackColors?: { on: string; off: string };
}

export default function CustomSwitch({
  value,
  isInit,
  onPress,
  duration = 400,
  size = { switchWidth: 45, switchHeight: 22, padding: 3 },
  trackColors = { on: colors.primary, off: colors.gray[25] },
}: SwitchProps) {
  const thumbSize = size.switchHeight - 2 * size.padding;

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      Number(value.value),
      [0, 1],
      [trackColors.off, trackColors.on],
    );
    const colorValue = withTiming(color, {
      duration: isInit.value ? 0 : duration,
    });

    return {
      backgroundColor: colorValue,
      borderRadius: size.switchHeight / 2,
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(
      Number(value.value),
      [0, 1],
      [0, size.switchWidth - size.switchHeight],
    );
    const translateValue = withTiming(moveValue, {
      duration: isInit.value ? 0 : duration,
    });

    return {
      transform: [{ translateX: translateValue }],
      borderRadius: size.switchHeight / 2,
    };
  });

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View
        className={`w-[${size.switchWidth}px] h-[${size.switchHeight}px] p-[${size.padding}px]`}
        style={[trackAnimatedStyle]}
      >
        <Animated.View
          className={`size-[${thumbSize}px] bg-white`}
          style={[thumbAnimatedStyle]}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
