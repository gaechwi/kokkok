import { HeaderWithUserPage } from "@/components/Header";
import CustomModal from "@/components/Modal";
import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import images from "@/constants/images";
import useFetchData from "@/hooks/useFetchData";
import {
  createFriendRequest,
  getCurrentUser,
  getMyPosts,
  getUser,
} from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const User = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userId } = useLocalSearchParams();

  const router = useRouter();

  const { data: currentUser } = useFetchData(
    ["currentUser"],
    getCurrentUser,
    "유저를 불러올 수 없습니다.",
  );

  const { data: user } = useFetchData(
    ["user", userId],
    () => getUser(userId as string),
    "유저를 불러올 수 없습니다.",
  );

  const { data: posts } = useFetchData(
    ["posts", userId],
    () => getMyPosts(userId as string),
    "게시물을 불러올 수 없습니다.",
  );

  return (
    <>
      <HeaderWithUserPage name={user?.username || ""} />
      <SafeAreaView edges={[]} className="flex-1 bg-white">
        <View className="w-full flex-1">
          <View className="mt-6 px-5">
            <View className="w-full flex-row justify-between pr-5">
              <View className="w-full flex-row items-center gap-6">
                <Image
                  source={
                    user?.avatarUrl
                      ? { uri: user.avatarUrl }
                      : images.AvaTarDefault
                  }
                  className="size-[88px] rounded-full"
                />
                <Text
                  className="title-3 flex-1"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {user?.username}
                </Text>
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
                {user?.description || "소개글을 입력해주세요"}
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
              keyExtractor={(item) => item.id.toString()}
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
            className="h-[82px] w-full items-center justify-center border-gray-20 border-b"
            onPress={async () => {
              await createFriendRequest(
                currentUser?.id as string,
                userId as string,
                null,
              );

              setIsModalVisible(false);
            }}
          >
            <Text className="title-2 text-gray-90">친구 요청하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="h-[82px] w-full items-center justify-center"
            onPress={() => {
              setIsModalVisible(false);
              router.push("/profile");
            }}
          >
            <Text className="title-2 text-gray-90">신고하기</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    </>
  );
};

export default User;
