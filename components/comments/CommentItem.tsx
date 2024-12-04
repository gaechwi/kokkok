import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import { diffDate } from "@/utils/formatDate";
import { toggleLikeComment } from "@/utils/supabase";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface CommentItemProps {
  id: number;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  liked?: boolean;
  likedAuthorAvatar: string[];
  createdAt: string;
}

export default function CommentItem({
  id,
  content,
  author,
  liked = false,
  likedAuthorAvatar = [],
  createdAt,
}: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(liked);

  const toggleLike = useMutation({
    mutationFn: () => toggleLikeComment(id),
    onMutate: () => {
      setIsLiked((prev) => !prev);
    },
    onError: () => {
      setIsLiked((prev) => !prev);
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
        </View>
      </View>

      {/* content */}
      <Text className="text-gray-90">{content}</Text>

      <TouchableOpacity className="mb-[16px]">
        <Text className="caption-2 text-gray-60">답글달기</Text>
      </TouchableOpacity>
    </View>
  );
}
