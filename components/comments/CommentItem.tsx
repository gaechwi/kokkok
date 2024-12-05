import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import useFetchData from "@/hooks/useFetchData";
import { useTruncateText } from "@/hooks/useTruncateText";
import { diffDate } from "@/utils/formatDate";
import { deleteComment, getUser, toggleLikeComment } from "@/utils/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
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
  topReply?: {
    id: number;
    contents: string;
    userId: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      avatarUrl: string | null;
    };
    isLiked: boolean;
    likedAvatars: string[];
  } | null;
}

export default function CommentItem({
  id,
  postId,
  contents,
  author,
  liked = false,
  likedAvatars,
  createdAt,
  topReply,
}: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isMore, setIsMore] = useState(false);
  const queryClient = useQueryClient();

  const { truncateText, calculateMaxChars } = useTruncateText();

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
    <View className="mb-4 gap-[13px] border-gray-20 border-b">
      {/* header */}
      <View className="flex-row items-center justify-between">
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
      <View className="flex-1 flex-row flex-wrap">
        <Text
          onPress={() => {
            if (contents.length > calculateMaxChars) {
              setIsMore(!isMore);
            }
          }}
          className="title-5 flex-1 text-gray-90"
        >
          {isMore ? contents : truncateText(contents)}
          {contents.length > calculateMaxChars && (
            <Text className="title-5 -mb-[3px] text-gray-45">
              {isMore ? " 접기" : "더보기"}
            </Text>
          )}
        </Text>
      </View>

      <TouchableOpacity className="mb-[16px]">
        <Text className="caption-2 text-gray-60">답글달기</Text>
      </TouchableOpacity>

      {/* reply */}
      {topReply && (
        <View className="px-4">
          <CommentItem
            id={topReply.id}
            postId={postId}
            author={topReply.user}
            contents={topReply.contents}
            createdAt={topReply.createdAt}
            liked={topReply.isLiked}
            likedAvatars={topReply.likedAvatars}
          />
        </View>
      )}
    </View>
  );
}
