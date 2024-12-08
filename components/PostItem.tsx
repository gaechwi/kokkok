import colors from "@/constants/colors";
import icons from "@/constants/icons";
import useFetchData from "@/hooks/useFetchData";
import { useTruncateText } from "@/hooks/useTruncateText";
import { diffDate } from "@/utils/formatDate";
import { deletePost, getCurrentUser, toggleLikePost } from "@/utils/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "./Carousel";
import CustomModal, { DeleteModal } from "./Modal";
interface PostItemProps {
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  images: string[];
  contents?: string | null;
  liked: boolean;
  likedAuthorAvatar?: string[];
  createdAt: string;
  commentsCount?: number;
  comment?: {
    author: {
      name: string;
      avatar: string;
    };
    content: string;
  } | null;
  postId: number;
  onCommentsPress: (num: number) => void;
}

export default function PostItem({
  author,
  images,
  contents,
  liked,
  likedAuthorAvatar,
  createdAt,
  commentsCount = 0,
  comment,
  postId,
  onCommentsPress,
}: PostItemProps) {
  const diff = diffDate(new Date(createdAt));
  const [isLiked, setIsLiked] = useState(liked);
  const [isMore, setIsMore] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const user = useFetchData(
    ["currentUser"],
    getCurrentUser,
    "사용자 정보를 불러오는데 실패했습니다.",
  );

  const { calculateMaxChars, truncateText } = useTruncateText();

  const toggleModal = () => setIsModalVisible((prev) => !prev);

  const toggleDeleteModal = () => setIsDeleteModalVisible((prev) => !prev);

  const toggleLike = useMutation({
    mutationFn: () => toggleLikePost(postId),
    onMutate: () => {
      setIsLiked((prev) => !prev);
    },
    onError: () => {
      setIsLiked((prev) => !prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      Alert.alert("삭제 성공", "게시물이 성공적으로 삭제되었습니다.");
    },
    onError: () => {
      Alert.alert("삭제 실패", "게시물 삭제에 실패했습니다.");
    },
  });

  return (
    <View className="grow bg-gray-10 pb-[10px]">
      <View className="grow bg-white ">
        {/* header */}
        <View className="flex-row items-center justify-between bg-white px-4">
          <TouchableOpacity>
            <View className="h-14 flex-row items-center gap-2">
              <Image
                source={{ uri: author.avatar }}
                resizeMode="cover"
                className="size-8 rounded-full"
              />
              {/* username */}
              <Text className="font-psemibold text-[13px] text-gray-80 leading-[150%]">
                {author.name}
              </Text>
            </View>
          </TouchableOpacity>

          {user.data?.id === author.id && (
            <TouchableOpacity onPress={toggleModal}>
              <icons.MeatballIcon
                width={24}
                height={24}
                color={colors.gray[70]}
              />

              <CustomModal
                visible={isModalVisible}
                onClose={toggleModal}
                position="bottom"
              >
                <View className="items-center">
                  <TouchableOpacity
                    onPress={() => {
                      toggleModal();
                      router.push(`/upload?postId=${postId}`);
                    }}
                    className="h-[82px] w-full items-center justify-center border-gray-20 border-b"
                  >
                    <Text className="title-2 text-gray-90">수정하기</Text>
                  </TouchableOpacity>
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
                  deletePostMutation.mutate();
                  setIsDeleteModalVisible(false);
                }}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* carousel */}
        <View className="h-max w-full bg-white pb-1">
          <Carousel images={images} />
        </View>

        {/* relation */}
        <View className="flex-row items-center justify-between bg-white px-4 pb-6">
          <View className="flex-row items-center pr-[2px]">
            {/* like */}
            <TouchableOpacity
              onPress={() => {
                if (!toggleLike.isPending) toggleLike.mutate();
              }}
            >
              <icons.HeartIcon
                width={24}
                height={24}
                color={isLiked ? colors.secondary.red : colors.gray[90]}
                fill={isLiked ? colors.secondary.red : "transparent"}
              />
            </TouchableOpacity>

            {/* likeAvatar */}
            {likedAuthorAvatar && likedAuthorAvatar.length > 0 && (
              <TouchableOpacity className="ml-[2px] flex-row items-center">
                {likedAuthorAvatar.slice(0, 2).map((avatar, index) => (
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
                {likedAuthorAvatar.length > 2 && (
                  <Text className="pl-[2px] font-psemibold text-[13px] text-gray-90 leading-[150%]">
                    외 여러명
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {/* comments */}
            <TouchableOpacity
              onPress={() => onCommentsPress(postId)}
              className="ml-[10px] flex-row items-center gap-[4px]"
            >
              <icons.CommentIcon
                width={24}
                height={24}
                color={colors.gray[90]}
              />
              {commentsCount > 0 && (
                <Text className="font-psemibold text-[13px] text-gray-90 leading-[150%]">
                  {commentsCount > 99 ? "99+" : commentsCount}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* createdAt */}
          <Text className="font-pmedium text-[10px] text-gray-50 leading-[150%]">
            {diff}
          </Text>
        </View>

        {(!!contents?.length || !!comment?.content?.length) && (
          <View className="bg-white px-4 pb-[22px]">
            {/* content */}
            {!!contents?.length && (
              <Pressable
                disabled={!isMore && contents.length <= calculateMaxChars}
                onPress={() => setIsMore(!isMore)}
                className="flex-row flex-wrap"
              >
                <Text className="title-5 text-gray-90">
                  {isMore ? contents : truncateText(contents)}
                  {contents.length > calculateMaxChars && (
                    <Text className="title-5 -mb-[3px] text-gray-45">
                      {isMore ? " 접기" : "더보기"}
                    </Text>
                  )}
                </Text>
              </Pressable>
            )}

            {/* comments */}
            {!!comment?.content?.length && (
              <Pressable
                onPress={() => onCommentsPress(postId)}
                className="mt-2 px-2"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-nowrap font-pbold text-[14px] text-gray-70 leading-[150%]">
                    {comment.author.name}
                  </Text>
                  <Text
                    className="body-3 flex-1 text-gray-90"
                    numberOfLines={1}
                  >
                    {comment.content}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
