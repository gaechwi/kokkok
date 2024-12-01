import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
} from "react-native";
import Carousel from "./Carousel";
import { diffDate } from "@/utils/formatDate";
import { useMemo, useState } from "react";
import icons from "@/constants/icons";
import CustomModal from "./Modal";
interface PostItemProps {
  author: {
    name: string;
    avatar: string;
  };
  images: string[];
  content?: string;
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
  content,
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

  const screenWidth = Dimensions.get("window").width;

  const calculateMaxChars = useMemo(() => {
    const fontScale = PixelRatio.getFontScale();
    const baseCharsPerLine = Math.floor(screenWidth / (11 * fontScale));
    return baseCharsPerLine * 2;
  }, [screenWidth]);

  const truncateText = (text: string) => {
    if (!text || text.length <= calculateMaxChars) return text;
    const truncated = text.slice(0, calculateMaxChars);
    const lastSentence = truncated.match(/[^.!?]*[.!?]+/g);
    if (lastSentence && lastSentence.length > 0) {
      return truncated.slice(
        0,
        truncated.lastIndexOf(lastSentence[lastSentence.length - 1]) + 1,
      );
    }
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  };

  const onOpenModal = () => {
    setIsModalVisible(true);
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View className="grow bg-gray-10 pb-[10px]">
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

        <TouchableOpacity onPress={onOpenModal}>
          <icons.MeatballIcon width={24} height={24} color="#5D5D5D" />

          <CustomModal
            visible={isModalVisible}
            onClose={onCloseModal}
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
      <View className="flex-row items-center justify-between bg-white px-4 pb-4">
        <View className="flex-row items-center gap-2 pr-[2px]">
          <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
            <icons.HeartIcon
              width={24}
              height={24}
              color={isLiked ? "#ff7a7a" : "#333333"}
              fill={isLiked ? "#ff7a7a" : "transparent"}
            />
          </TouchableOpacity>
          {likedAuthorAvatar && likedAuthorAvatar.length > 0 && (
            <TouchableOpacity className="flex-row items-center">
              {likedAuthorAvatar.slice(0, 2).map((avatar, index) => (
                <Image
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  key={`avatar-${index}`}
                  source={{ uri: avatar }}
                  resizeMode="cover"
                  className="-ml-[5px] size-[24px] rounded-full"
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
          <TouchableOpacity className="flex-row items-center gap-[2px]">
            <icons.CommentIcon width={24} height={24} color="#333333" />
            {commentsCount > 0 && (
              <Text className="caption-1 text-gray-90">
                {commentsCount > 99 ? "99+" : commentsCount}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text className="caption-3 text-gray-50">{diff}</Text>
      </View>

      {/* content */}
      {content && (
        <View className="bg-white px-4 pb-4">
          <View className="flex-row flex-wrap">
            <Text className="body-2 text-gray-90">
              {isMore ? content : truncateText(content)}
              {content.length > calculateMaxChars && (
                <Text>{!isMore && "..."}</Text>
              )}
              {content.length > calculateMaxChars && (
                <TouchableOpacity
                  onPress={() => setIsMore(!isMore)}
                  className="flex-row items-start justify-center"
                >
                  <Text className="body-2 -mt-[10px] h-[17px] text-gray-45">
                    {isMore ? "  접기" : "더보기"}
                  </Text>
                </TouchableOpacity>
              )}
            </Text>
          </View>
        </View>
      )}

      {/* comments */}
      {comment && (
        <View className="bg-white px-6 pb-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-nowrap font-pbold text-[15px] text-gray-70 leading-[150%]">
              {comment.author.name}
            </Text>
            <Text className="body-2 flex-1 text-gray-90" numberOfLines={1}>
              {comment.content}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
