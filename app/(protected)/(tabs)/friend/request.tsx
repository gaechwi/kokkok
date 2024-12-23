import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ErrorScreen from "@/components/ErrorScreen";
import { FriendRequest } from "@/components/FriendItem";
import LoadingScreen from "@/components/LoadingScreen";
import colors from "@/constants/colors";
import useInfiniteLoad from "@/hooks/useInfiniteLoad";
import { getFriendRequests, supabase } from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";

const LIMIT = 12;

export default function Request() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  // 유저의 친구 요청 정보 조회
  const {
    data: requestData,
    isLoading,
    isFetchingNextPage,
    error,
    loadMore,
  } = useInfiniteLoad({
    queryFn: getFriendRequests,
    queryKey: ["friendRequests"],
    limit: LIMIT,
  });
  const hasRequests = !!requestData?.pages[0].total;

  // 친구 요청창에 focus 들어올 때마다 친구목록 새로고침
  useFocusEffect(() => {
    if (!isFetchingNextPage) {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    }
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
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <FlatList
        className="w-full grow px-8"
        data={hasRequests ? requestData.pages.flatMap((page) => page.data) : []}
        keyExtractor={(request) => String(request.requestId)}
        renderItem={({ item: request }) => (
          <FriendRequest {...request} isLoading={isLoading} />
        )}
        onEndReached={loadMore}
        contentContainerStyle={hasRequests ? {} : { flex: 1 }}
        ListHeaderComponent={<View className="h-2" />}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              size="large"
              className="py-4"
              color={colors.primary}
            />
          ) : (
            <View className="h-4" />
          )
        }
        ListEmptyComponent={
          <ErrorScreen errorMessage="친구 요청이 없습니다." />
        }
      />
    </SafeAreaView>
  );
}
