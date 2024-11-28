import { Modal, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import { View } from "react-native";

interface BottomModalProps {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
}

export default function BottomModal({
  children,
  visible,
  onClose,
}: BottomModalProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      duration: 400,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }).start();
  }, [visible, slideAnim]);

  const AnimatedView = Animated.createAnimatedComponent(View);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50" onTouchStart={onClose}>
        <AnimatedView
          className="rounded-t-xl bg-white"
          style={{
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [500, 0],
                }),
              },
            ],
          }}
        >
          <SafeAreaView edges={["bottom"]} className="h-fit">
            {children}
          </SafeAreaView>
        </AnimatedView>
      </View>
    </Modal>
  );
}
