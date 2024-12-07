import useFetchData from "@/hooks/useFetchData";
import { createComment, getComments, getCurrentUser } from "@/utils/supabase";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  Text,
  type TextInput,
  View,
} from "react-native";
import MotionModal from "../MotionModal";
import CommentItem from "./CommentItem";
import MentionInput from "./MentionInput";

const { height: deviceHeight } = Dimensions.get("window");

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
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<{
    username: string;
    parentId: number;
    replyCommentId: number;
  } | null>(null);
  const queryClient = useQueryClient();
  const inputRef = useRef<TextInput>(null);

  // 유저 정보 가져오기
  const user = useFetchData(
    ["user"],
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
    username: string,
    parentId: number,
    replyCommentId: number,
  ) => {
    setReplyTo({ username, parentId, replyCommentId: replyCommentId });
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
    <MotionModal
      visible={visible}
      onClose={onClose}
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
          ListHeaderComponent={<View className="h-4" />}
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
            replyTo ? `${replyTo.username}님에게 답글` : "댓글을 입력해주세요."
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
    </MotionModal>
  );
}
