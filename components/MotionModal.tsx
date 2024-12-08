import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight: number;
  initialHeight: number;
  closeThreshold?: number;
}

export default function MotionModal({
  visible,
  onClose,
  children,
  maxHeight,
  initialHeight,
  closeThreshold = 0.1,
}: CustomModalProps) {
  const slideAnim = useMemo(() => new Animated.Value(0), []);
  const heightAnim = useMemo(
    () => new Animated.Value(initialHeight),
    [initialHeight],
  );
  const heightRef = useRef(initialHeight);
  const maxHeightRef = useRef(maxHeight);

  const clampHeight = useCallback(
    (height: number) => Math.min(maxHeightRef.current, Math.max(0, height)),
    [],
  );

  const handleClose = useCallback(() => {
    Animated.timing(heightAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      onClose();
      setTimeout(() => {
        heightRef.current = initialHeight;
        heightAnim.setValue(initialHeight);
      }, 100);
    });
  }, [onClose, heightAnim, initialHeight]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          const newHeight = clampHeight(heightRef.current - gestureState.dy);
          heightAnim.setValue(newHeight);
        },
        onPanResponderRelease: (_, gestureState) => {
          const finalHeight = heightRef.current - gestureState.dy;
          const closeHeight = maxHeightRef.current * closeThreshold;

          if (finalHeight < closeHeight) {
            handleClose();
          } else if (finalHeight > maxHeightRef.current) {
            heightRef.current = maxHeightRef.current;
            Animated.spring(heightAnim, {
              toValue: maxHeightRef.current,
              useNativeDriver: false,
            }).start();
          } else {
            const clampedHeight = clampHeight(finalHeight);
            heightRef.current = clampedHeight;
            Animated.spring(heightAnim, {
              toValue: clampedHeight,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [heightAnim, closeThreshold, clampHeight, handleClose],
  );

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyboardShow = (e: { endCoordinates: { height: number } }) => {
      const keyboardHeight = e.endCoordinates.height;
      const newHeight = maxHeightRef.current - keyboardHeight;
      maxHeightRef.current = newHeight;
      heightRef.current = clampHeight(newHeight);
      Animated.timing(heightAnim, {
        toValue: heightRef.current,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    const handleKeyboardHide = () => {
      maxHeightRef.current = maxHeight;
      heightRef.current = clampHeight(maxHeightRef.current);
      Animated.timing(heightAnim, {
        toValue: heightRef.current,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const keyboardShowListener = Keyboard.addListener(
      showEvent,
      handleKeyboardShow,
    );
    const keyboardHideListener = Keyboard.addListener(
      hideEvent,
      handleKeyboardHide,
    );

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [heightAnim, clampHeight, maxHeight]);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback
          onPressOut={(e) => {
            if (e.target === e.currentTarget) {
              Keyboard.dismiss();
              handleClose();
              e.stopPropagation();
            }
          }}
        >
          <View className="flex-1 justify-end bg-black/50">
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [maxHeightRef.current, 0],
                    }),
                  },
                ],
                height: heightAnim,
              }}
            >
              <SafeAreaView
                edges={["bottom", "top"]}
                className="h-full rounded-t-[20px] border border-gray-20 bg-white"
              >
                <View
                  className="w-full items-center py-2.5"
                  {...panResponder.panHandlers}
                >
                  <View className="h-1 w-10 rounded-[2px] bg-gray-25" />
                </View>
                {children}
              </SafeAreaView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
