import { useEffect, useMemo, useRef, useCallback } from "react";
import {
  Modal,
  Animated,
  Easing,
  FlatList,
  View,
  Text,
  PanResponder,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CommentItem from "./CommentItem";

const { height: deviceHeight } = Dimensions.get("window");
const MIN_HEIGHT = 0;
const CLOSE_THRESHOLD = deviceHeight * 0.2;
const MAX_HEIGHT = deviceHeight;
const DURATION = 400;

const ANIMATION_CONFIG = {
  useNativeDriver: true,
  duration: DURATION,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
};

interface CommentsSectionProps {
  visible: boolean;
  onClose: () => void;
  comments: Parameters<typeof CommentItem>[0][];
}

export default function CommentsSection({
  visible,
  onClose,
  comments,
}: CommentsSectionProps) {
  const slideAnim = useMemo(() => new Animated.Value(0), []);
  const heightRef = useRef(deviceHeight * 0.8);
  const heightAnim = useMemo(() => new Animated.Value(heightRef.current), []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      ...ANIMATION_CONFIG,
    }).start();
  }, [visible, slideAnim]);

  const handleClose = useCallback(() => {
    Animated.timing(heightAnim, {
      toValue: 0,
      duration: DURATION,
      useNativeDriver: false,
    }).start(() => {
      onClose();
      setTimeout(() => {
        heightRef.current = deviceHeight * 0.8;
        heightAnim.setValue(heightRef.current);
      }, 100);
    });
  }, [onClose, heightAnim]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          const newHeight = Math.min(
            MAX_HEIGHT,
            Math.max(MIN_HEIGHT, heightRef.current - gestureState.dy),
          );
          heightAnim.setValue(newHeight);
        },
        onPanResponderRelease: (_, gestureState) => {
          const finalHeight = heightRef.current - gestureState.dy;

          if (finalHeight < CLOSE_THRESHOLD) {
            // 최소 높이보다 작으면 닫힘
            onClose();
            setTimeout(() => {
              heightRef.current = deviceHeight * 0.8;
              heightAnim.setValue(heightRef.current);
            }, DURATION);
          } else if (finalHeight > MAX_HEIGHT) {
            // 최대 높이보다 크면 최대 높이로 돌아감
            heightRef.current = MAX_HEIGHT;
            Animated.spring(heightAnim, {
              toValue: MAX_HEIGHT,
              useNativeDriver: false,
            }).start();
          } else {
            // 최소 높이보다 작으면 최소 높이로 돌아감
            const clampedHeight = Math.min(
              MAX_HEIGHT,
              Math.max(MIN_HEIGHT, finalHeight),
            );
            heightRef.current = clampedHeight;
            Animated.spring(heightAnim, {
              toValue: clampedHeight,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [heightAnim, onClose],
  );

  const AnimatedView = Animated.createAnimatedComponent(View);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        className="flex-1 justify-end bg-black/50"
        onTouchStart={handleClose}
      >
        <AnimatedView
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [deviceHeight, 0],
                }),
              },
            ],
          }}
        >
          <Animated.View
            style={{
              height: heightAnim,
              overflow: "hidden",
            }}
          >
            <SafeAreaView
              edges={["bottom"]}
              className="h-full rounded-t-[20px] border border-gray-300 bg-white px-8"
            >
              <View
                className="w-full items-center py-2.5"
                {...panResponder.panHandlers}
              >
                <View className="h-1 w-10 rounded-[2px] bg-gray-200" />
              </View>

              <FlatList
                data={comments}
                keyExtractor={(item) => item.id.toString()}
                initialNumToRender={10}
                removeClippedSubviews
                ListHeaderComponent={
                  <View className="mb-2.5 w-full">
                    <Text className="heading-2 text-center">댓글</Text>
                  </View>
                }
                renderItem={({ item }) => <CommentItem {...item} />}
                ListEmptyComponent={
                  <Text className="heading-2 mt-5 text-center text-gray-90">
                    아직 댓글이 없습니다.
                  </Text>
                }
              />
            </SafeAreaView>
          </Animated.View>
        </AnimatedView>
      </View>
    </Modal>
  );
}
