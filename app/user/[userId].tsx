import { HeaderWithUsername } from "@/components/Header";
import CustomModal from "@/components/Modal";
import PostGrid from "@/components/PostGrid";
import ProfileSection from "@/components/ProfileSection";
import useFetchData from "@/hooks/useFetchData";
import useManageFriend from "@/hooks/useManageFriend";
import { RELATION_TYPE, type RelationType } from "@/types/Friend.interface";
import type { UserProfile } from "@/types/User.interface";
import {
  getCurrentUser,
  getFriendStatus,
  getMyPosts,
  getUser,
  supabase,
} from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RequestButtonProps {
  currentUser: UserProfile;
  userId: string;
  relation: RelationType;
  onPress: () => void;
}

function RequestButton({
  currentUser,
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
        handleUnfriend({ fromUserId: currentUser.id, toUserId: userId }),
    },
    [RELATION_TYPE.ASKING]: {
      message: "친구 요청 취소",
      onPress: () =>
        handleUnfriend({ fromUserId: currentUser.id, toUserId: userId }),
    },
    [RELATION_TYPE.ASKED]: {
      message: "친구 요청 수락",
      onPress: () => handleAccept({ fromUserId: userId, toUser: currentUser }),
    },
    [RELATION_TYPE.NONE]: {
      message: "친구 요청",
      onPress: () => handleCreate({ fromUser: currentUser, toUserId: userId }),
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
  const queryClient = useQueryClient();

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

  const { data: posts, isError: isPostsError } = useFetchData(
    ["posts", userId],
    () => getMyPosts(userId as string),
    "게시물을 불러올 수 없습니다.",
  );

  const { data: relation, isPending: isRelationPending } = useFetchData(
    ["relation", currentUser?.id, userId],
    () => getFriendStatus(currentUser?.id || "", userId as string),
    "친구 정보를 불러올 수 없습니다.",
    !!currentUser,
  );

  // 친구 요청이 추가되면 쿼리 다시 패치하도록 정보 구독
  useEffect(() => {
    if (!currentUser) return;

    const requestChannel = supabase
      .channel("friendRequest")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friendRequest",
          filter: `to=eq.${currentUser.id}`,
        },
        (payload) => {
          if (payload.new.from === userId)
            queryClient.invalidateQueries({
              queryKey: ["relation", currentUser.id, userId],
            });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestChannel);
    };
  }, [currentUser, userId, queryClient.invalidateQueries]);

  return (
    <>
      <HeaderWithUsername name={user?.username || ""} />
      <SafeAreaView edges={[]} className="flex-1 bg-white">
        <View className="w-full flex-1">
          <ProfileSection
            username={user?.username || ""}
            avatarUrl={user?.avatarUrl || undefined}
            description={user?.description || undefined}
            onSettingsPress={() => setIsModalVisible(true)}
          />
          <PostGrid
            posts={
              posts
                ? posts.map((post) => ({ ...post, id: post.id.toString() }))
                : null
            }
            isError={isPostsError}
          />
        </View>
      </SafeAreaView>
      <CustomModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        position="bottom"
      >
        <View className="items-center">
          {relation && currentUser && !isRelationPending && (
            <RequestButton
              currentUser={currentUser}
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
