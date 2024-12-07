import { HeaderWithUserPage } from "@/components/Header";
import CustomModal from "@/components/Modal";
import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import images from "@/constants/images";
import useFetchData from "@/hooks/useFetchData";
import useManageFriend from "@/hooks/useManageFriend";
import { RELATION_TYPE, type RelationType } from "@/types/Friend.interface";
import {
  getCurrentUser,
  getFriendStatus,
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

interface RequestButtonProps {
  currentUserId: string;
  userId: string;
  relation: RelationType;
  onPress: () => void;
}

function RequestButton({
  currentUserId,
  userId,
  relation,
  onPress,
}: RequestButtonProps) {
  const { useUnfriend, useAcceptRequest, useCreateRequest } = useManageFriend();
  const { mutate: handleUnfriend } = useUnfriend();
  const { mutate: handleAccept } = useAcceptRequest();
  const { mutate: handleCreate } = useCreateRequest();

  const BUTTON_CONFIG = {
    [RELATION_TYPE.FRIEND]: {
      message: "친구 끊기",
      onPress: () =>
        handleUnfriend({ fromUserId: currentUserId, toUserId: userId }),
    },
    [RELATION_TYPE.ASKING]: {
      message: "친구 요청 취소",
      onPress: () =>
        handleUnfriend({ fromUserId: currentUserId, toUserId: userId }),
    },
    [RELATION_TYPE.ASKED]: {
      message: "친구 요청 수락",
      onPress: () =>
        handleAccept({ fromUserId: userId, toUserId: currentUserId }),
    },
    [RELATION_TYPE.NONE]: {
      message: "친구 요청",
      onPress: () =>
        handleCreate({ fromUserId: currentUserId, toUserId: userId }),
    },
  };

  return (
    <TouchableOpacity
      className="h-[82px] w-full items-center justify-center border-gray-20 border-b"
      onPress={() => {
        BUTTON_CONFIG[relation].onPress();
        onPress();
      }}
    >
      <Text className="title-2 text-gray-90">
        {BUTTON_CONFIG[relation].message}
      </Text>
    </TouchableOpacity>
  );
}

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

  const { data: relation, error: relationError } = useFetchData(
    ["relation", currentUser?.id, userId],
    () => getFriendStatus(currentUser?.id || "", userId as string),
    "친구 정보를 불러올 수 없습니다.",
    !!currentUser,
  );

  return (
    <>
      <HeaderWithUserPage name={user?.username || ""} />
      <SafeAreaView edges={[]} className="flex-1 bg-white">
        <View className="w-full flex-1">
          <View className="mt-6 px-5">
            <View className="flex-row justify-between">
              <View className="flex-row items-center gap-6">
                <Image
                  source={
                    user?.avatarUrl
                      ? { uri: user.avatarUrl }
                      : images.AvaTarDefault
                  }
                  className="size-[88px] rounded-full"
                />
                <Text className="title-3">{user?.username}</Text>
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
              keyExtractor={(item) => String(item.id)}
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
          {/* relation이 올바르고, 유저 정보 있을 때에만 친구관련 버튼 보이도록 설정 */}
          {relation && currentUser && (
            <RequestButton
              currentUserId={currentUser.id}
              userId={userId as string}
              relation={relation}
              onPress={() => setIsModalVisible(false)}
            />
          )}
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
