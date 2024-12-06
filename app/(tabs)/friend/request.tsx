import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";

import { FriendRequest } from "@/components/FriendItem";
import {
  getCurrentSession,
  getFriendRequests,
  supabase,
} from "@/utils/supabase";
import useFetchData from "@/hooks/useFetchData";
import type { RequestResponse } from "@/types/Friend.interface";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

const OFFSET = 0;
const LIMIT = 12;

export default function Request() {
  const queryClient = useQueryClient();

  // 로그인한 유저 정보 조회
  const { data: session, error: userError } = useFetchData<Session>(
    ["session"],
    getCurrentSession,
    "로그인 정보 조회에 실패했습니다.",
  );

  // 유저의 친구 요청 정보 조회
  const {
    data: requests,
    isLoading,
    error,
  } = useFetchData<RequestResponse>(
    ["friendRequests", OFFSET],
    () => getFriendRequests(session?.user.id || ""),
    "친구 요청 조회에 실패했습니다.",
    !!session?.user,
  );

  // 친구 요청이 추가되면 쿼리 다시 패치하도록 정보 구독
  useEffect(() => {
    if (!session) return;

    const requestChannel = supabase
      .channel("friendRequest")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friendRequest",
          filter: `to=eq.${session.user.id}`,
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
  }, [session, queryClient.invalidateQueries]);

  // 에러 스크린
  if (error || userError) {
    return (
      <ErrorScreen
        errorMessage={
          error?.message || userError?.message || "친구 조회에 실패했습니다."
        }
      />
    );
  }

  // 로딩 스크린
  if (isLoading || !requests) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <FlatList
        data={requests.data}
        keyExtractor={(request) => request.requestId}
        renderItem={({ item: request }) => (
          <FriendRequest {...request} isLoading={isLoading} />
        )}
        className="px-8 grow w-full"
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
