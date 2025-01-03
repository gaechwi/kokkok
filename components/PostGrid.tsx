import images from "@/constants/images";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import {
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  View,
} from "react-native";

interface Post {
  id: string;
  images: string[];
}

interface PostGridProps {
  refetch: () => void;
  posts: Post[] | null;
  isError?: boolean;
}

export default function PostGrid({ refetch, posts, isError }: PostGridProps) {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  if (isError) {
    return (
      <View className="mt-8 flex-1 items-center justify-center bg-gray-5">
        <Image
          source={images.ErrorPost}
          className="h-[178px] w-[234px]"
          resizeMode="contain"
          accessibilityLabel="게시물을 불러오지 못했습니다."
          accessibilityRole="image"
        />
      </View>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <View className="mt-8 flex-1 items-center justify-center bg-gray-5">
        <Image
          source={images.NoPost}
          className="h-[178px] w-[234px]"
          resizeMode="contain"
          accessibilityLabel="게시물이 없습니다."
          accessibilityRole="image"
        />
      </View>
    );
  }

  const handleScrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    refetch();
  }, [refetch]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "SCROLL_MY_PAGE_TO_TOP",
      handleScrollToTop,
    );

    return () => subscription.remove();
  }, [handleScrollToTop]);

  return (
    <View className="mt-[32px] h-full bg-gray-5">
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={({ item }) => {
          const size = Dimensions.get("window").width / 3;
          return (
            <View style={{ height: size, width: size }}>
              <TouchableOpacity onPress={() => router.push(`/post/${item.id}`)}>
                <Image
                  source={{ uri: item.images[0] }}
                  resizeMode="cover"
                  style={{ width: "100%", height: "100%" }}
                  defaultSource={images.ErrorPost}
                />
              </TouchableOpacity>
            </View>
          );
        }}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}
