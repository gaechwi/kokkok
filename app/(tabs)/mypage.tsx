import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentUser, getMyPosts } from "@/utils/supabase";
import images from "@/constants/images";
import Icons from "@/constants/icons";
import colors from "@/constants/colors";
import { useState } from "react";
import CustomModal from "@/components/Modal";
import { useRouter } from "expo-router";
import useFetchData from "@/hooks/useFetchData";

export default function MyPage() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: currentUser, isLoading: isUserLoading } = useFetchData(
    ["currentUser"],
    getCurrentUser,
    "현재 사용자를 불러올 수 없습니다.",
  );

  const { data: posts, isLoading: isPostsLoading } = useFetchData(
    ["userPosts", currentUser?.id],
    () => getMyPosts(currentUser?.id!),
    "게시물을 불러올 수 없습니다.",
    !!currentUser?.id,
  );

  if (isUserLoading || isPostsLoading) {
    return (
      <SafeAreaView edges={[]} className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text>로딩중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView edges={[]} className="flex-1 bg-white">
        <View className="w-full flex-1">
          <View className="mt-6 px-5">
            <View className="flex-row justify-between">
              <View className="flex-row items-center gap-6">
                <Image
                  source={
                    currentUser?.avatarUrl
                      ? { uri: currentUser.avatarUrl }
                      : images.AvaTarDefault
                  }
                  className="size-[88px] rounded-full"
                />
                <Text className="title-3">{currentUser?.username}</Text>
              </View>
              <View>
                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                  <Icons.MeatballIcon
                    height={24}
                    width={24}
                    color={colors.gray[70]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-4 rounded-[10px] bg-[#f0f0f0] p-4">
              <Text className="body-5 text-gray-80">
                {currentUser?.description || "소개글을 입력해주세요"}
              </Text>
            </View>
          </View>

          {posts && posts.length > 0 ? (
            <FlatList
              data={posts}
              renderItem={({ item }) => {
                const size = Dimensions.get("window").width / 3;
                return (
                  <View
                    style={{ height: size, width: size }}
                    className="bg-gray-5"
                  >
                    <Image
                      source={{ uri: item.images[0] }}
                      resizeMode="cover"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                );
              }}
              numColumns={3}
              keyExtractor={(item) => item.id}
              className="mt-[32px]"
            />
          ) : (
            <View className="mt-8 flex-1 items-center justify-center bg-gray-5">
              <Image
                source={images.NoPost}
                className="h-[178px] w-[234px]"
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </SafeAreaView>
      <CustomModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        position="bottom"
      >
        <View className="items-center">
          <TouchableOpacity
            className="h-[82px] w-full items-center justify-center"
            onPress={() => {
              setIsModalVisible(false);
              router.push("/profile");
            }}
          >
            <Text className="title-2 text-gray-90">수정하기</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    </>
  );
}
