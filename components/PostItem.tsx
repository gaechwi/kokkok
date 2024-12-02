import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import Carousel from "./Carousel";
import { diffDate } from "@/utils/formatDate";
import { useState } from "react";
import icons from "@/constants/icons";
import CustomModal from "./Modal";
import colors from "@/constants/colors";
import { useTruncateText } from "@/hooks/useTruncateText";
import CommentsSection from "./comments/CommentsSection";
interface PostItemProps {
  author: {
    name: string;
    avatar: string;
  };
  images: string[];
  contents?: string;
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
  };
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
}: PostItemProps) {
  const diff = diffDate(new Date(createdAt));
  const [isLiked, setIsLiked] = useState(liked);
  const [isMore, setIsMore] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);

  const { calculateMaxChars, truncateText } = useTruncateText();

  const toggleModal = () => {
    setIsModalVisible((prev) => !prev);
  };

  const toggleComments = () => {
    setIsCommentsVisible((prev) => !prev);
  };

  return (
    <View className="grow bg-gray-10 pb-[10px]">
      <View className="grow bg-white ">
        {/* header */}
        <View className="flex-row items-center justify-between bg-white px-4">
          <TouchableOpacity>
            <View className="h-14 flex-row items-center gap-4">
              <Image
                source={{ uri: author.avatar }}
                resizeMode="cover"
                className="size-8 rounded-full"
              />
              <Text className="body-3 text-gray-80">{author.name}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleModal}>
            <icons.MeatballIcon width={24} height={24} color="#5D5D5D" />

            <CustomModal
              visible={isModalVisible}
              onClose={toggleModal}
              position="bottom"
            >
              <View className="items-center">
                <TouchableOpacity className="h-[82px] w-full items-center justify-center border-gray-20 border-b">
                  <Text className="title-2 text-gray-90">수정하기</Text>
                </TouchableOpacity>
                <TouchableOpacity className="h-[82px] w-full items-center justify-center">
                  <Text className="title-2 text-gray-90">삭제하기</Text>
                </TouchableOpacity>
              </View>
            </CustomModal>
          </TouchableOpacity>
        </View>

        {/* carousel */}
        <View className="h-max w-full bg-white pb-1">
          <Carousel images={images} />
        </View>

        {/* relation */}
        <View className="flex-row items-center justify-between bg-white px-4 pb-6">
          <View className="flex-row items-center pr-[2px]">
            {/* like */}
            <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
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
                  <Text className="pl-[2px] font-pbold text-[13px] text-gray-90 leading-[150%]">
                    외 여러명
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {/* comments */}
            <TouchableOpacity
              onPress={toggleComments}
              className="ml-[10px] flex-row items-center gap-[4px]"
            >
              <icons.CommentIcon
                width={24}
                height={24}
                color={colors.gray[90]}
              />
              {commentsCount > 0 && (
                <Text className="font-pbold text-[13px] text-gray-90 leading-[150%]">
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

        {(contents || comment) && (
          <View className="bg-white px-4 pb-[22px]">
            {/* content */}
            {contents && (
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
            {comment && (
              <Pressable onPress={toggleComments} className="mt-2 px-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-nowrap font-pbold text-[15px] text-gray-70 leading-[150%]">
                    {comment.author.name}
                  </Text>
                  <Text
                    className="body-2 flex-1 text-gray-90"
                    numberOfLines={1}
                  >
                    {comment.content}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        )}

        <View className="flex-1">
          <CommentsSection
            visible={isCommentsVisible}
            onClose={toggleComments}
            comments={[
              {
                id: Math.random().toString(),
                user: {
                  id: Math.random().toString(),
                  avatar: "https://via.placeholder.com/150",
                  username: "John Doe",
                },
                content: "Hello, World!",
                createdAt: "2022-01-01T00:00:00Z",
                liked: false,
                likes: 10,
                likedAuthorAvatar: [
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                ],
              },
              {
                id: Math.random().toString(),
                user: {
                  id: Math.random().toString(),
                  avatar: "https://via.placeholder.com/150",
                  username: "Jane Doe",
                },
                content: "Hello, World!",
                createdAt: "2022-01-01T00:00:00Z",
                liked: false,
                likes: 10,
                likedAuthorAvatar: [
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                ],
              },
              {
                id: Math.random().toString(),
                user: {
                  id: Math.random().toString(),
                  avatar: "https://via.placeholder.com/150",
                  username: "Jane Doe",
                },
                content: "Hello, World!",
                createdAt: "2022-01-01T00:00:00Z",
                liked: false,
                likes: 10,
                likedAuthorAvatar: [
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                ],
              },
              {
                id: Math.random().toString(),
                user: {
                  id: Math.random().toString(),
                  avatar: "https://via.placeholder.com/150",
                  username: "Jane Doe",
                },
                content: "Hello, World!",
                createdAt: "2022-01-01T00:00:00Z",
                liked: false,
                likes: 10,
                likedAuthorAvatar: [
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                ],
              },
              {
                id: Math.random().toString(),
                user: {
                  id: Math.random().toString(),
                  avatar: "https://via.placeholder.com/150",
                  username: "Jane Doe",
                },
                content: "Hello, World!",
                createdAt: "2022-01-01T00:00:00Z",
                liked: false,
                likes: 10,
                likedAuthorAvatar: [
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                ],
              },
              {
                id: Math.random().toString(),
                user: {
                  id: Math.random().toString(),
                  avatar: "https://via.placeholder.com/150",
                  username: "Jane Doe",
                },
                content: "Hello, World!",
                createdAt: "2022-01-01T00:00:00Z",
                liked: false,
                likes: 10,
                likedAuthorAvatar: [
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                ],
              },
              {
                id: Math.random().toString(),
                user: {
                  id: Math.random().toString(),
                  avatar: "https://via.placeholder.com/150",
                  username: "Jane Doe",
                },
                content: "Hello, World!",
                createdAt: "2022-01-01T00:00:00Z",
                liked: false,
                likes: 10,
                likedAuthorAvatar: [
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                ],
              },
              {
                id: Math.random().toString(),
                user: {
                  id: Math.random().toString(),
                  avatar: "https://via.placeholder.com/150",
                  username: "Jane Doe",
                },
                content: "Hello, World!",
                createdAt: "2022-01-01T00:00:00Z",
                liked: false,
                likes: 10,
                likedAuthorAvatar: [
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                ],
              },
              {
                id: Math.random().toString(),
                user: {
                  id: Math.random().toString(),
                  avatar: "https://via.placeholder.com/150",
                  username: "Jane Doe",
                },
                content: "Hello, World!",
                createdAt: "2022-01-01T00:00:00Z",
                liked: false,
                likes: 10,
                likedAuthorAvatar: [
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                ],
              },
              {
                id: Math.random().toString(),
                user: {
                  id: Math.random().toString(),
                  avatar: "https://via.placeholder.com/150",
                  username: "Jane Doe",
                },
                content: "Hello, World!",
                createdAt: "2022-01-01T00:00:00Z",
                liked: false,
                likes: 10,
                likedAuthorAvatar: [
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                ],
              },
              {
                id: Math.random().toString(),
                user: {
                  id: Math.random().toString(),
                  avatar: "https://via.placeholder.com/150",
                  username: "Jane Doe",
                },
                content: "Hello, World!",
                createdAt: "2022-01-01T00:00:00Z",
                liked: false,
                likes: 10,
                likedAuthorAvatar: [
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                  "https://via.placeholder.com/150",
                ],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}
