import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import {
  Modal,
  Animated,
  Easing,
  FlatList,
  View,
  Text,
  PanResponder,
  Dimensions,
  RefreshControl,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  ActivityIndicator,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CommentItem from "./CommentItem";
import { LinearGradient } from "expo-linear-gradient";

const { height: deviceHeight } = Dimensions.get("window");
const COMMENT_INPUT_HEIGHT = Platform.OS === "ios" ? 90 : 82;
const MIN_HEIGHT = 0;
const CLOSE_THRESHOLD = (deviceHeight - COMMENT_INPUT_HEIGHT) * 0.1;
const MAX_HEIGHT = deviceHeight - COMMENT_INPUT_HEIGHT;
const DEFAULT_HEIGHT = MAX_HEIGHT * 0.8;
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
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const slideAnim = useMemo(() => new Animated.Value(0), []);
  const heightRef = useRef(DEFAULT_HEIGHT);
  const heightAnim = useMemo(() => new Animated.Value(heightRef.current), []);
  const user = {
    id: "151232aws2132",
    username: "난이름",
    avatar:
      "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1730962073092-thumbnail.webp",
  };
  const [comment, setComment] = useState("");

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        heightRef.current = MAX_HEIGHT - e.endCoordinates.height;
        heightAnim.setValue(heightRef.current);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        heightRef.current = MAX_HEIGHT;
        Animated.timing(heightAnim, {
          toValue: MAX_HEIGHT,
          duration: 250,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: false,
        }).start();
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [heightAnim]);

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
        heightRef.current = DEFAULT_HEIGHT;
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
              heightRef.current = DEFAULT_HEIGHT;
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

  const onRefresh = useCallback(async () => {
    //   setRefreshing(true);
    //   setPage(0);
    //   await fetchPosts();
    //   setRefreshing(false);
  }, []);

  const loadMorePosts = useCallback(async () => {
    // if (loading || !posts.hasMore) return;
    // setLoading(true);
    // const nextPage = page + 1;
    // const morePosts = await getPosts({
    //   offset: nextPage * LIMIT,
    //   limit: LIMIT,
    // });
    // setPosts((prev) => {
    //   const existingIds = new Set(prev.posts.map((post) => post.id));
    //   const newPosts = morePosts.posts.filter(
    //     (post) => !existingIds.has(post.id),
    //   );
    //   return {
    //     posts: [...prev.posts, ...newPosts],
    //     total: morePosts.total,
    //     hasMore: morePosts.hasMore && newPosts.length > 0,
    //   };
    // });
    // setPage(nextPage);
    // setLoading(false);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const isEndReached =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

      if (isEndReached) {
        loadMorePosts();
      }
    },
    [loadMorePosts],
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          className="flex-1 justify-end bg-black/50"
          onTouchEnd={handleClose}
        >
          {/* comment list */}
          <AnimatedView
            onTouchEnd={(e) => e.stopPropagation()}
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
                className="h-full rounded-t-[20px] border border-gray-300 bg-white"
              >
                <View className="flex-1">
                  <View
                    className="w-full items-center py-2.5"
                    {...panResponder.panHandlers}
                  >
                    <View className="h-1 w-10 rounded-[2px] bg-gray-200" />
                  </View>

                  <View className="relative z-10 w-full pb-2.5">
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 1)",
                        "rgba(255, 255, 255, 0)",
                      ]}
                      start={[0, 0]}
                      end={[0, 1]}
                      style={{
                        position: "absolute",
                        top: 37,
                        left: 0,
                        right: 0,
                        height: 10,
                        zIndex: 1,
                      }}
                    />
                    <Text className="heading-2 text-center">댓글</Text>
                  </View>

                  <FlatList
                    className="px-8"
                    data={comments}
                    keyExtractor={(item) => item.id.toString()}
                    initialNumToRender={10}
                    removeClippedSubviews
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => <CommentItem {...item} />}
                    ListHeaderComponent={<View className="pt-4" />}
                    ListEmptyComponent={
                      <Text className="heading-2 mt-5 text-center text-gray-90">
                        아직 댓글이 없습니다.
                      </Text>
                    }
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                      />
                    }
                    onEndReached={loadMorePosts}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                      loading ? (
                        <ActivityIndicator size="large" className="py-4" />
                      ) : null
                    }
                    onScroll={handleScroll}
                  />
                </View>
              </SafeAreaView>
            </Animated.View>
          </AnimatedView>

          {/* comment input */}
          <View
            onTouchEnd={(e) => e.stopPropagation()}
            className={`flex-row items-center gap-4 border-gray-20 border-t bg-white px-[18px] pt-4 ${Platform.OS === "ios" ? "pb-6" : "pb-4"}`}
          >
            <Image
              source={{ uri: user.avatar }}
              resizeMode="cover"
              className="size-12 rounded-full"
            />

            <TextInput
              className="h-[50px] flex-1 rounded-[10px] border border-gray-20 px-4 focus:border-primary"
              placeholder="댓글을 입력해주세요."
              keyboardType="default"
              autoCapitalize="words"
              accessibilityLabel="댓글 입력"
              accessibilityHint="댓글을 입력해주세요."
              value={comment}
              onChangeText={(text) => setComment(text)}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
