import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import useFetchData from "@/hooks/useFetchData";
import { useTruncateText } from "@/hooks/useTruncateText";
import { diffDate } from "@/utils/formatDate";
import {
  deleteComment,
  getReplies,
  getUser,
  toggleLikeComment,
} from "@/utils/supabase";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native";
import CustomModal, { DeleteModal } from "../Modal";

interface CommentItemProps {
  id: number;
  postId: number;
  contents: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  liked?: boolean;
  likedAvatars: string[];
  createdAt: string;
  parentsCommentId?: number;
  totalReplies?: number;
  topReply?: {
    id: number;
    contents: string;
    userId: string;
    createdAt: string;
    parentsCommentId: number;
    user: {
      id: string;
      username: string;
      avatarUrl: string | null;
    };
    isLiked: boolean;
    likedAvatars: string[];
  } | null;
  onReply: (username: string, parentId: number) => void;
  isReply?: boolean;
}

export default function CommentItem({
  id,
  postId,
  contents,
  author,
  liked = false,
  likedAvatars,
  createdAt,
  parentsCommentId,
  totalReplies,
  topReply,
  onReply,
  isReply = false,
}: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isTextMore, setIsTextMore] = useState(false);
  const queryClient = useQueryClient();
  const [isMoreReply, setIsMoreReply] = useState(false);

  const { truncateText, calculateMaxChars } = useTruncateText();

  // 답글 가져오기
  const {
    data: replyData,
    fetchNextPage: replyFetchNextPage,
    hasNextPage: replyHasNextPage,
    isFetchingNextPage: isReplyFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["replies", id],
    queryFn: ({ pageParam = 0 }) => getReplies(id, pageParam, 5),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextPage : undefined,
    enabled: isMoreReply,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
    initialPageParam: 0,
  });

  // 답글 더 불러오기
  const loadMoreReply = useCallback(() => {
    if (!isMoreReply) {
      setIsMoreReply(true);
      return;
    }
    if (replyHasNextPage && !isReplyFetchingNextPage) {
      replyFetchNextPage();
    }
  }, [
    replyHasNextPage,
    isReplyFetchingNextPage,
    replyFetchNextPage,
    isMoreReply,
  ]);

  const toggleModal = () => {
    setIsModalVisible((prev) => !prev);
  };

  const toggleDeleteModal = () => {
    setIsDeleteModalVisible((prev) => !prev);
  };

  const toggleLike = useMutation({
    mutationFn: () => toggleLikeComment(id),
    onMutate: () => {
      setIsLiked((prev) => !prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: () => {
      setIsLiked((prev) => !prev);
    },
  });

  const user = useFetchData(
    ["user"],
    getUser,
    "사용자 정보를 불러오는데 실패했습니다.",
  );

  const deleteCommentMutation = useMutation({
    mutationFn: () => deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      Alert.alert("삭제 실패", "댓글 삭제에 실패했습니다.");
    },
  });

  const diff = diffDate(new Date(createdAt));

  if (!author) return null;
  if (!author.avatarUrl) return null;

  return (
    <View>
      {/* header */}
      <View className="flex-row items-center justify-between pb-[13px]">
        {/* user info */}
        <TouchableOpacity className="flex-1">
          <View className="flex-1 flex-row items-center gap-2 ">
            <Image
              source={{ uri: author.avatarUrl }}
              resizeMode="cover"
              className="size-12 rounded-full"
            />
            <View className="max-w-[80%]">
              <Text
                className="title-4 text-black"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {author.username}
              </Text>
              <Text className="font-pmedium text-[10px] text-gray-50 leading-[150%]">
                {diff}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center">
          {/* like */}
          <TouchableOpacity
            onPress={() => {
              if (!toggleLike.isPending) toggleLike.mutate();
            }}
          >
            <Icons.HeartIcon
              width={24}
              height={24}
              color={isLiked ? colors.secondary.red : colors.black}
              fill={isLiked ? colors.secondary.red : "transparent"}
            />
          </TouchableOpacity>

          {/* likeAvatar */}
          {likedAvatars && likedAvatars.length > 0 && (
            <TouchableOpacity className="ml-[2px] flex-row items-center">
              {likedAvatars.slice(0, 2).map((avatar, index) => (
                <Image
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  key={`avatar-${index}`}
                  source={{ uri: avatar }}
                  resizeMode="cover"
                  className={`size-[24px] rounded-full ${index !== 0 ? "-ml-[9px]" : ""}`}
                  style={{
                    zIndex: 5 - index,
                    borderWidth: 1,
                    borderColor: "white",
                  }}
                />
              ))}
              {likedAvatars.length > 2 && (
                <Text className="pl-[2px] font-pbold text-[13px] text-gray-90 leading-[150%]">
                  외 여러명
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* kebab menu */}
          {user.data?.id === author.id && (
            <TouchableOpacity onPress={toggleModal} className="ml-2">
              <Icons.KebabMenuIcon
                width={24}
                height={24}
                color={colors.black}
              />

              <CustomModal
                visible={isModalVisible}
                onClose={toggleModal}
                position="bottom"
              >
                <View className="items-center">
                  <TouchableOpacity
                    onPress={() => {
                      toggleDeleteModal();
                      toggleModal();
                    }}
                    className="h-[82px] w-full items-center justify-center"
                  >
                    <Text className="title-2 text-gray-90">삭제하기</Text>
                  </TouchableOpacity>
                </View>
              </CustomModal>

              <DeleteModal
                isVisible={isDeleteModalVisible}
                onClose={toggleDeleteModal}
                onDelete={() => {
                  if (deleteCommentMutation.isPending) return;
                  deleteCommentMutation.mutate();
                  toggleDeleteModal();
                }}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* contents */}
      <View className="flex-1 flex-row flex-wrap pb-[13px]">
        <Text
          onPress={() => {
            if (contents.length > calculateMaxChars) {
              setIsTextMore(!isTextMore);
            }
          }}
          className="title-5 flex-1 text-gray-90"
        >
          {isTextMore ? contents : truncateText(contents)}
          {contents.length > calculateMaxChars && (
            <Text className="title-5 -mb-[3px] text-gray-45">
              {isTextMore ? " 접기" : "더보기"}
            </Text>
          )}
        </Text>
      </View>

      {/* reply button */}
      <TouchableOpacity
        className={isReply ? "pb-[5px]" : "pb-[13px]"}
        onPress={() => onReply(author.username, parentsCommentId ?? id)}
      >
        <Text className="caption-2 text-gray-60">답글달기</Text>
      </TouchableOpacity>

      {/* top reply */}
      {topReply && (
        <View className="px-4">
          <CommentItem
            id={topReply.id}
            postId={postId}
            contents={topReply.contents}
            author={{
              id: topReply.user.id,
              username: topReply.user.username,
              avatarUrl: topReply.user.avatarUrl,
            }}
            liked={topReply.isLiked}
            likedAvatars={topReply.likedAvatars}
            createdAt={topReply.createdAt}
            parentsCommentId={topReply.parentsCommentId}
            onReply={onReply}
            isReply={true}
          />

          {replyData && replyData.pages.length > 0 && (
            <FlatList
              className="gap-2"
              data={replyData.pages.flatMap((page) => page.replies)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <CommentItem
                  id={item.id}
                  postId={postId}
                  contents={item.contents}
                  author={{
                    id: item.userData.id,
                    username: item.userData.username,
                    avatarUrl: item.userData.avatarUrl,
                  }}
                  liked={item.isLiked}
                  likedAvatars={item.likedAvatars}
                  createdAt={item.createdAt}
                  parentsCommentId={item.parentsCommentId}
                  onReply={onReply}
                  isReply={true}
                />
              )}
              ListFooterComponent={() =>
                isReplyFetchingNextPage ? (
                  <ActivityIndicator size="small" />
                ) : null
              }
            />
          )}

          {totalReplies &&
            totalReplies > 0 &&
            !!(
              totalReplies -
              (replyData?.pages.reduce(
                (acc, page) => acc + page.replies.length,
                0,
              ) ?? 0)
            ) &&
            (!isMoreReply || replyHasNextPage) && (
              <TouchableOpacity
                onPress={loadMoreReply}
                className="w-full flex-1 items-center justify-center"
              >
                <Text className="font-pregular text-[11px] text-gray-60">
                  + 답글{" "}
                  {totalReplies -
                    (replyData?.pages.reduce(
                      (acc, page) => acc + page.replies.length,
                      0,
                    ) ?? 0)}
                  개 더보기
                </Text>
              </TouchableOpacity>
            )}
        </View>
      )}

      {/* divider */}
      {!isReply && <View className="mt-2 mb-4 h-[1px] w-full bg-gray-20" />}
    </View>
  );
}
