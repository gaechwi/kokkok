import images from "@/constants/images";
import { useRouter } from "expo-router";
import {
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
  posts: Post[] | null;
}

export default function PostGrid({ posts }: PostGridProps) {
  const router = useRouter();

  if (!posts || posts.length === 0) {
    return (
      <View className="mt-8 flex-1 items-center justify-center bg-gray-5">
        <Image
          source={images.NoPost}
          className="h-[178px] w-[234px]"
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View className="mt-[32px] h-full bg-gray-5">
      <FlatList
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
