import { useEffect, useMemo, useRef } from "react";
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
const MAX_HEIGHT = deviceHeight * 0.92;
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
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        onTouchStart={onClose}
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
              style={{
                maxHeight: "100%",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderColor: "#D3D3D3",
                borderWidth: 1,
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 30,
              }}
            >
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  paddingVertical: 10,
                }}
                {...panResponder.panHandlers}
              >
                <View
                  style={{
                    height: 4,
                    width: 40,
                    backgroundColor: "#E0E0E0",
                    borderRadius: 2,
                  }}
                />
              </View>

              <FlatList
                data={comments}
                keyExtractor={(item) => item.id.toString()}
                initialNumToRender={10}
                removeClippedSubviews
                ListHeaderComponent={
                  <View style={{ marginBottom: 10, width: "100%" }}>
                    <Text style={{ fontSize: 20, textAlign: "center" }}>
                      댓글
                    </Text>
                  </View>
                }
                renderItem={({ item }) => <CommentItem {...item} />}
                ListEmptyComponent={
                  <Text
                    style={{
                      marginTop: 20,
                      textAlign: "center",
                      color: "#A0A0A0",
                    }}
                  >
                    No comments yet.
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
