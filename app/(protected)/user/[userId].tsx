import { HeaderWithUsername } from "@/components/Header";
import PostGrid from "@/components/PostGrid";
import ProfileSection from "@/components/ProfileSection";
import useFetchData from "@/hooks/useFetchData";
import { useModal } from "@/hooks/useModal";
import type { RelationType } from "@/types/Friend.interface";
import {
  getRelationship,
  getUser,
  getUserPosts,
  supabase,
} from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const User = () => {
  const { openModal } = useModal();
  const { userId } = useLocalSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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

  // 유저 아이디 불러오기
  useEffect(() => {
    const handleLoadId = async () => {
      try {
        setCurrentUserId(await SecureStore.getItemAsync("userId"));
      } catch (error) {
        console.error("userId 조회 중 오류 발생:", error);
        setCurrentUserId(null);
      }
    };

    handleLoadId();
  }, []);

  // 친구 요청이 추가되면 쿼리 다시 패치하도록 정보 구독
  useEffect(() => {
    const requestChannel = supabase
      .channel("friendRequest")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friendRequest",
          filter: `to=eq.${currentUserId}`,
        },
        (payload) => {
          if (payload.new.from === userId)
            queryClient.invalidateQueries({
              queryKey: ["relation", userId],
            });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestChannel);
    };
  }, [currentUserId, userId, queryClient.invalidateQueries]);

  return (
    <>
      <HeaderWithUsername name={user?.username || ""} />
      <SafeAreaView edges={[]} className="flex-1 bg-white">
        <View className="w-full flex-1">
          <ProfileSection
            username={user?.username || ""}
            avatarUrl={user?.avatarUrl || undefined}
            description={user?.description || undefined}
            onSettingsPress={() =>
              openModal(
                {
                  type: "SELECT_FRIEND_REQUEST",
                  userId: userId as string,
                  relation: relation as RelationType,
                },
                "bottom",
              )
            }
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
    </>
  );
};

export default User;
