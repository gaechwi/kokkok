import useFetchData from "@/hooks/useFetchData";
import { createComment, getComments, getCurrentUser } from "@/utils/supabase";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  RefreshControl,
  Text,
  type TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CommentItem from "./CommentItem";
import MentionInput from "./MentionInput";

const { height: deviceHeight } = Dimensions.get("window");
const COMMENT_INPUT_HEIGHT = Platform.OS === "ios" ? 112 : 74;
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

  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<{
    username: string;
    parentId: number;
  } | null>(null);
  const [maxHeight, setMaxHeight] = useState(MAX_HEIGHT);
  const animationRef = useRef<Animated.CompositeAnimation>();
  const queryClient = useQueryClient();
  const inputRef = useRef<TextInput>(null);
  const [previousText, setPreviousText] = useState("");

  // 유저 정보 가져오기
  const user = useFetchData(
    ["user"],
    getCurrentUser,
    "사용자 정보를 불러오는데 실패했습니다.",
  );

  // 댓글 가져오기
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

  // 댓글 더 불러오기
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 키보드 이벤트 처리
  useEffect(() => {
    // 애니메이션 정리
    const cleanupAnimations = () => animationRef.current?.stop();

    // 키보드가 나타나면 높이 조절
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        animationRef.current?.stop();
        heightRef.current = MAX_HEIGHT - e.endCoordinates.height;
        setMaxHeight(heightRef.current);
        heightAnim.setValue(heightRef.current);
      },
    );

    // 키보드가 사라지면 높이 조절
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

  // 댓글 목록 열기 애니메이션
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: visible ? 1 : 0,
        duration: DURATION,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // 댓글 목록 닫기
  const handleClose = useCallback(() => {
    Animated.timing(heightAnim, {
      toValue: 0,
      duration: DURATION,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
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
            handleClose();
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
    [heightAnim, maxHeight, clampHeight, handleClose],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    setRefreshing(false);
  }, [queryClient, postId]);

  // 답글달기 핸들러
  const handleReply = (username: string, parentId: number) => {
    setReplyTo({ username, parentId });
    inputRef.current?.focus();
  };

  const writeCommentMutation = useMutation({
    mutationFn: () =>
      createComment({ postId, contents: comment, parentId: replyTo?.parentId }),
    onSuccess: () => {
      setComment("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["replies"] });
    },
    onError: () => {
      Alert.alert("댓글 작성 실패", "댓글 작성에 실패했습니다.");
    },
  });

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
            {/* comment list */}
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [MAX_HEIGHT, 0],
                    }),
                  },
                ],
              }}
            >
              <Animated.View
                style={{
                  height: heightAnim,
                }}
              >
                <SafeAreaView
                  edges={["bottom", "top"]}
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
                      onEndReached={() => {
                        if (!isFetchingNextPage) loadMore();
                      }}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                        />
                      }
                      removeClippedSubviews={false}
                      maxToRenderPerBatch={10}
                      windowSize={5}
                      getItemLayout={(data, index) => ({
                        length: 100,
                        offset: 100 * index,
                        index,
                      })}
                      renderItem={({ item }) => (
                        <CommentItem
                          key={item.id}
                          id={Number(item.id)}
                          postId={postId}
                          contents={item.contents}
                          createdAt={item.createdAt}
                          likedAvatars={item.likedAvatars}
                          liked={item.isLiked}
                          author={item.userData}
                          totalReplies={item.totalReplies}
                          topReply={item.topReply}
                          onReply={handleReply}
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
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>

        {/* comment input */}
        <View
          className={`z-10 h-20 flex-row items-center gap-4 bg-white px-[18px] pt-4 ${Platform.OS === "ios" ? "pb-8" : "pb-4"}`}
        >
          <Image
            source={{ uri: user.data?.avatarUrl || undefined }}
            resizeMode="cover"
            className="size-12 rounded-full"
          />

          <MentionInput
            ref={inputRef}
            value={comment}
            onChangeText={(text) => {
              setComment(text);
            }}
            setReplyTo={setReplyTo}
            placeholder={
              replyTo ? `${replyTo.username}님에게 답글` : "댓글 달기"
            }
            mentionUser={replyTo}
            onSubmit={() => {
              if (comment.trim() && !writeCommentMutation.isPending) {
                writeCommentMutation.mutate();
              }
            }}
            isPending={writeCommentMutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
