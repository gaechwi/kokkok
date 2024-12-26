import { HeaderWithUsername } from "@/components/Header";
import CustomModal from "@/components/Modal";
import PostGrid from "@/components/PostGrid";
import ProfileSection from "@/components/ProfileSection";
import useFetchData from "@/hooks/useFetchData";
import useManageFriend from "@/hooks/useManageFriend";
import { RELATION_TYPE, type RelationType } from "@/types/Friend.interface";
import {
  getRelationship,
  getUser,
  getUserPosts,
  subscribeFriendRequest,
  supabase,
} from "@/utils/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RequestButtonProps {
  userId: string;
  relation: RelationType;
  onPress: () => void;
}

function RequestButton({ userId, relation, onPress }: RequestButtonProps) {
  const { useUnfriend, useAcceptRequest, useCreateRequest } = useManageFriend();
  const { mutate: handleUnfriend } = useUnfriend();
  const { mutate: handleAccept } = useAcceptRequest();
  const { mutate: handleCreate } = useCreateRequest();

  const BUTTON_CONFIG = {
    [RELATION_TYPE.FRIEND]: {
      message: "친구 끊기",
      onPress: () => handleUnfriend({ toUserId: userId }),
    },
    [RELATION_TYPE.ASKING]: {
      message: "친구 요청 취소",
      onPress: () => handleUnfriend({ toUserId: userId }),
    },
    [RELATION_TYPE.ASKED]: {
      message: "친구 요청 수락",
      onPress: () => handleAccept({ fromUserId: userId }),
    },
    [RELATION_TYPE.NONE]: {
      message: "친구 요청",
      onPress: () => handleCreate({ toUserId: userId }),
    },
  };

  return (
    <TouchableOpacity
      className="h-[82px] w-full items-center justify-center"
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
  const queryClient = useQueryClient();

  const { data: user } = useFetchData(
    ["user", userId],
    () => getUser(userId as string),
    "유저를 불러올 수 없습니다.",
  );

  const { data: posts, isError: isPostsError } = useFetchData(
    ["posts", userId],
    () => getUserPosts(userId as string),
    "게시물을 불러올 수 없습니다.",
  );

  const { data: relation, isPending: isRelationPending } = useFetchData(
    ["relation", userId],
    () => getRelationship(userId as string),
    "친구 정보를 불러올 수 없습니다.",
  );

  // 친구 요청이 추가되면 쿼리 다시 패치하도록 정보 구독
  useEffect(() => {
    let requestChannel: RealtimeChannel;

    const handleSubscribe = async () => {
      requestChannel = await subscribeFriendRequest((payload) => {
        if (payload.new.from === userId)
          queryClient.invalidateQueries({ queryKey: ["relation", userId] });
      });
    };

    handleSubscribe();

    return () => {
      supabase.removeChannel(requestChannel);
    };
  }, [userId, queryClient.invalidateQueries]);

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
          {relation && !isRelationPending && (
            <RequestButton
              userId={userId as string}
              relation={relation}
              onPress={() => setIsModalVisible(false)}
            />
          )}
        </View>
      </CustomModal>
    </>
  );
};

export default User;
