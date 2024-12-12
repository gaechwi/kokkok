import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import images from "@/constants/images";
import useFetchData from "@/hooks/useFetchData";
import {
  createComment,
  createNotification,
  getCommentLikes,
  getComments,
  getCurrentUser,
} from "@/utils/supabase";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  Text,
  type TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import MotionModal from "../MotionModal";
import { ToastConfig, showToast } from "../ToastConfig";
import CommentItem from "./CommentItem";
import MentionInput from "./MentionInput";

const { height: deviceHeight } = Dimensions.get("window");

interface CommentsSectionProps {
  visible: boolean;
  onClose: () => void;
  postId: number;
  authorId: string;
}

export default function CommentsSection({
  visible,
  onClose,
  postId,
  authorId,
}: CommentsSectionProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<{
    userId: string;
    username: string;
    parentId: number;
    replyCommentId: number;
  } | null>(null);
  const [isLikedModalVisible, setIsLikedModalVisible] = useState(false);
  const [likedAuthorId, setLikedAuthorId] = useState<number | null>(null);
  const [isToast, setIsToast] = useState(false);

  const queryClient = useQueryClient();
  const inputRef = useRef<TextInput>(null);

  const router = useRouter();

  const { data: likedAuthor } = useFetchData(
    ["likedAuthor", likedAuthorId],
    () => {
      if (likedAuthorId) return getCommentLikes(likedAuthorId);
      return Promise.resolve([]);
    },
    "좋아요 한 사용자 정보를 불러오는데 실패했습니다.",
    isLikedModalVisible,
  );

  // 유저 정보 가져오기
  const user = useFetchData(
    ["currentUser"],
    getCurrentUser,
    "사용자 정보를 불러오는데 실패했습니다.",
  );

  // 댓글 가져오기
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
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
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // 답글달기 핸들러
  const handleReply = (
    userId: string,
    username: string,
    parentId: number,
    replyCommentId: number,
  ) => {
    setReplyTo({ userId, username, parentId, replyCommentId: replyCommentId });
    inputRef.current?.focus();
  };

  // 댓글 작성
  const writeCommentMutation = useMutation({
    mutationFn: () =>
      createComment({
        postId,
        contents: comment,
        parentId: replyTo?.parentId,
        replyCommentId: replyTo?.replyCommentId,
      }),
    onSuccess: (data) => {
      showToast("success", "댓글이 작성되었어요!");

      const replyToId = replyTo?.userId || authorId;
      if (replyToId !== user.data?.id) {
        sendNotificationMutation.mutate({ commentId: data.id });
      }

      setComment("");
      setReplyTo(null);

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["replies"] });
    },
    onError: () => {
      showToast("fail", "댓글 작성에 실패했어요!");
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: ({ commentId }: { commentId: number }) =>
      createNotification({
        from: user.data?.id || "",
        to: replyTo?.userId || authorId || "",
        type: "comment",
        data: {
          postId,
          commentInfo: {
            id: commentId,
            content: comment,
          },
        },
      }),
  });
  const onLikedAuthorPress = useCallback((commentId: number) => {
    setLikedAuthorId(commentId);
    setIsLikedModalVisible(true);
  }, []);

  return (
    <MotionModal
      visible={visible}
      onClose={() => {
        onClose();
        queryClient.removeQueries({ queryKey: ["comments", postId] });
        setIsToast(false);
      }}
      maxHeight={deviceHeight}
      initialHeight={deviceHeight * 0.8}
    >
      <View className="flex-1">
        <View className="relative z-10 w-full pb-2.5">
          <LinearGradient
            colors={["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0)"]}
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
          ListHeaderComponent={
            !data ? (
              <View className="mt-4">
                {[...Array(5)].map((_, index) => (
                  <View
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    key={`skeleton-${index}`}
                    className="mb-8 animate-pulse gap-[13px]"
                  >
                    <View className="h-12 flex-1 flex-row items-center gap-2">
                      <View className="size-12 rounded-full bg-gray-25" />

                      <View className="h-12 flex-1 justify-center gap-[5px]">
                        <View className="h-[16px] w-16 rounded-md bg-gray-25" />
                        <View className="h-[13px] w-10 rounded-md bg-gray-25" />
                      </View>

                      <View className="size-[28px] rounded-full bg-gray-25" />
                    </View>

                    <View className="gap-[13px]">
                      <View className="h-[18px] w-[80%] rounded-md bg-gray-25" />
                      <View className="h-[14px] w-10 rounded-md bg-gray-25" />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="h-4" />
            )
          }
          data={data?.pages.flatMap((page) => page.comments) || []}
          keyExtractor={(item) => item.id.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!isFetchingNextPage) loadMore();
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
              onReply={handleReply}
              onCommentsClose={onClose}
              onLikedAuthorPress={onLikedAuthorPress}
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
              <Text className="title-3 text-gray-70">아직 댓글이 없어요.</Text>
            </View>
          }
        />
      </View>

      {isLikedModalVisible && (
        <MotionModal
          visible={isLikedModalVisible}
          onClose={() => setIsLikedModalVisible(false)}
          maxHeight={deviceHeight}
          initialHeight={deviceHeight * 0.6}
        >
          <View className="flex-1 ">
            <FlatList
              className="w-full px-4 py-2 "
              data={likedAuthor}
              keyExtractor={(item, index) => `liked-author-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setIsLikedModalVisible(false);
                    onClose();
                    if (user.data?.id === item.author?.id)
                      router.push("/mypage");
                    else router.push(`/user/${item.author?.id}`);
                  }}
                  className="w-full flex-1 flex-row items-center gap-2 px-2 py-4"
                >
                  <Image
                    source={
                      item.author?.avatarUrl
                        ? { uri: item.author?.avatarUrl }
                        : images.AvaTarDefault
                    }
                    resizeMode="cover"
                    className="size-10 rounded-full"
                  />
                  <Text
                    className="flex-1 font-psemibold text-[16px] text-gray-90 leading-[150%]"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.author?.username}
                  </Text>

                  <Icons.HeartIcon
                    width={24}
                    height={24}
                    color={colors.secondary.red}
                    fill={colors.secondary.red}
                  />
                </TouchableOpacity>
              )}
            />
          </View>
        </MotionModal>
      )}

      {/* comment input */}
      <View
        className={`z-10 h-20 w-full flex-row items-center gap-4 bg-white px-[18px] pt-4 ${Platform.OS === "ios" ? "pb-8" : "pb-4"}`}
      >
        <Image
          source={
            user.data?.avatarUrl
              ? { uri: user.data.avatarUrl }
              : images.AvaTarDefault
          }
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
            replyTo ? `${replyTo.username}님에게 답글` : "댓글을 입력해주세요."
          }
          mentionUser={replyTo}
          onSubmit={() => {
            if (comment.trim() && !writeCommentMutation.isPending) {
              setIsToast(true);
              writeCommentMutation.mutate();
            }
          }}
          isPending={writeCommentMutation.isPending}
        />
      </View>
      {isToast && <Toast config={ToastConfig} />}
    </MotionModal>
  );
}
