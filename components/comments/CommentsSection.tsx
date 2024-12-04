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
import { getComments } from "@/utils/supabase";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";

const { height: deviceHeight } = Dimensions.get("window");
const COMMENT_INPUT_HEIGHT = Platform.OS === "ios" ? 90 : 82;
const MIN_HEIGHT = 0;
const CLOSE_THRESHOLD = (deviceHeight - COMMENT_INPUT_HEIGHT) * 0.1;
const MAX_HEIGHT = deviceHeight - COMMENT_INPUT_HEIGHT;
const DEFAULT_HEIGHT = MAX_HEIGHT * 0.8;
const DURATION = 400;

interface CommentsSectionProps {
  visible: boolean;
  onClose: () => void;
  postId: number;
}

export default function CommentsSection({
  visible,
  onClose,
  postId,
}: CommentsSectionProps) {
  const [refreshing, setRefreshing] = useState(false);
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
  const [maxHeight, setMaxHeight] = useState(MAX_HEIGHT);
  const animationRef = useRef<Animated.CompositeAnimation>();
  const queryClient = useQueryClient();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["comments", postId],
      queryFn: ({ pageParam = 0 }) => getComments(postId, pageParam, 5),
      getNextPageParam: (lastPage) =>
        lastPage.hasNext ? lastPage.nextPage : undefined,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      placeholderData: keepPreviousData,
      initialPageParam: 0,
    });

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const cleanupAnimations = () => animationRef.current?.stop();

    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        animationRef.current?.stop();
        heightRef.current = MAX_HEIGHT - e.endCoordinates.height;
        setMaxHeight(heightRef.current);
        heightAnim.setValue(heightRef.current);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        animationRef.current?.stop();
        heightRef.current = MAX_HEIGHT;
        setMaxHeight(heightRef.current);
        animationRef.current = Animated.timing(heightAnim, {
          toValue: MAX_HEIGHT,
          duration: 300,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        });
        animationRef.current.start();
      },
    );

    return () => {
      cleanupAnimations();
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [heightAnim]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: DURATION,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
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

  const clampHeight = useCallback(
    (height: number) => Math.min(maxHeight, Math.max(MIN_HEIGHT, height)),
    [maxHeight],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,

        onPanResponderMove: (_, gestureState) => {
          // 최소 높이보다 작거나 최대 높이보다 크지 않도록 함
          const newHeight = clampHeight(heightRef.current - gestureState.dy);
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
          } else if (finalHeight > maxHeight) {
            // 최대 높이보다 크면 최대 높이로 돌아감
            heightRef.current = maxHeight;
            Animated.spring(heightAnim, {
              toValue: maxHeight,
              useNativeDriver: false,
            }).start();
          } else {
            // 최소 높이보다 작으면 최소 높이로 돌아감
            const clampedHeight = clampHeight(finalHeight);
            heightRef.current = clampedHeight;
            Animated.spring(heightAnim, {
              toValue: clampedHeight,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [heightAnim, onClose, maxHeight, clampHeight],
  );

  const AnimatedView = Animated.createAnimatedComponent(View);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    setRefreshing(false);
  }, [queryClient, postId]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -500}
        style={{ flex: 1 }}
      >
        <View
          className="flex-1 justify-end bg-black/50"
          onTouchEnd={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          {/* comment list */}
          <AnimatedView
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
                edges={[]}
                className="h-full rounded-t-[20px] border border-gray-20 bg-white"
              >
                <View className="flex-1">
                  <View
                    className="w-full items-center py-2.5"
                    {...panResponder.panHandlers}
                  >
                    <View className="h-1 w-10 rounded-[2px] bg-gray-25" />
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
                        top: 36,
                        left: 0,
                        right: 0,
                        height: 10,
                        zIndex: 1,
                      }}
                    />
                    <Text className="heading-2 text-center">댓글</Text>
                  </View>

                  <FlatList
                    className="flex-1 px-8"
                    maintainVisibleContentPosition={{
                      minIndexForVisible: 0,
                    }}
                    ListHeaderComponent={<View className="h-4" />}
                    data={data?.pages.flatMap((page) => page.comments) || []}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReachedThreshold={0.5}
                    onEndReached={loadMore}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                      />
                    }
                    renderItem={({ item }) => (
                      <CommentItem
                        key={item.id}
                        id={Number(item.id)}
                        content={item.contents}
                        createdAt={item.createdAt}
                        likedAuthorAvatar={[]}
                        liked={item.isLiked}
                        author={item.user}
                      />
                    )}
                    ListFooterComponent={
                      isFetchingNextPage ? (
                        <ActivityIndicator size="large" className="py-4" />
                      ) : null
                    }
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={
                      <View className="flex-1 items-center justify-center">
                        <Text className="title-3 text-gray-70">
                          아직 댓글이 없어요.
                        </Text>
                      </View>
                    }
                  />
                </View>
              </SafeAreaView>
            </Animated.View>
          </AnimatedView>
        </View>

        {/* comment input */}
        <View
          className={`z-10 flex-row items-center gap-4 bg-white px-[18px] pt-4 ${Platform.OS === "ios" ? "pb-6" : "pb-4"}`}
        >
          <Image
            source={{ uri: user.avatar }}
            resizeMode="cover"
            className="size-12 rounded-full"
          />

          <TextInput
            className="z-10 max-h-[120px] min-h-[50px] flex-1 rounded-[10px] border border-gray-20 px-4 py-3 focus:border-primary"
            placeholder="댓글을 입력해주세요."
            autoCapitalize="words"
            keyboardType="default"
            textAlignVertical="center"
            accessibilityLabel="댓글 입력"
            accessibilityHint="댓글을 입력해주세요."
            value={comment}
            onChangeText={(text) => setComment(text)}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
