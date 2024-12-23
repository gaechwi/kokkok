import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ErrorScreen from "@/components/ErrorScreen";
import { FriendRequest } from "@/components/FriendItem";
import LoadingScreen from "@/components/LoadingScreen";
import useFetchData from "@/hooks/useFetchData";
import type { RequestResponse } from "@/types/Friend.interface";
import { getFriendRequests, supabase } from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";

const OFFSET = 0;
const LIMIT = 12;

export default function Request() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  // 유저의 친구 요청 정보 조회
  const {
    data: requests,
    isLoading,
    error,
  } = useFetchData<RequestResponse>(
    ["friendRequests", OFFSET],
    () => getFriendRequests(),
    "친구 요청 조회에 실패했습니다.",
  );

  // 친구 요청창에 focus 들어올 때마다 친구목록 새로고침
  useFocusEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
  });

  // 유저 아이디 불러오기
  useEffect(() => {
    const handleLoadId = async () => {
      try {
        setUserId(await SecureStore.getItemAsync("userId"));
      } catch (error) {
        console.error("userId 조회 중 오류 발생:", error);
        setUserId(null);
      }
    };

    handleLoadId();
  }, []);

  // 친구 요청이 추가되면 쿼리 다시 패치하도록 정보 구독
  useEffect(() => {
    if (!userId) return;

    const requestChannel = supabase
      .channel("friendRequest")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friendRequest",
          filter: `to=eq.${userId}`,
        },
        (payload) => {
          if (!payload.new.isAccepted)
            queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestChannel);
    };
  }, [userId, queryClient.invalidateQueries]);

  // 에러 스크린
  if (error) {
    return <ErrorScreen errorMessage={error.message} />;
  }

  // 로딩 스크린
  if (isLoading || !requests) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <FlatList
        data={requests.data}
        keyExtractor={(request) => String(request.requestId)}
        renderItem={({ item: request }) => (
          <FriendRequest {...request} isLoading={isLoading} />
        )}
        className="w-full grow px-8"
        contentContainerStyle={requests.data.length ? {} : { flex: 1 }}
        ListHeaderComponent={<View className="h-2" />}
        ListFooterComponent={<View className="h-4" />}
        ListEmptyComponent={
          <ErrorScreen errorMessage="친구 요청이 없습니다." />
        }
      />
    </SafeAreaView>
  );
}
