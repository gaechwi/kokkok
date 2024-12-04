import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";

import { FriendRequest } from "@/components/FriendItem";
import { getFriendRequests, supabase } from "@/utils/supabase";
import useFetchData from "@/hooks/useFetchData";
import type { RequestResponse } from "@/types/Friend.interface";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";
import { useQueryClient } from "@tanstack/react-query";

const OFFSET = 0;
const LIMIT = 12;

export default function Request() {
  const queryClient = useQueryClient();

  const {
    data: requests,
    isLoading,
    error,
  } = useFetchData<RequestResponse>(
    ["friendRequests", OFFSET],
    () => getFriendRequests({ offset: OFFSET, limit: LIMIT }),
    "친구 요청 조회에 실패했습니다.",
  );

  useEffect(() => {
    const userId = "8a49fc55-8604-4e9a-9c7d-b33a813f3344";

    const requestChannel = supabase
      .channel("friendRequest")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "friendRequest" },
        (payload) => {
          if (!payload.new.isAccepted && payload.new.to === userId)
            queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestChannel);
    };
  }, [queryClient.invalidateQueries]);

  if (error) {
    return (
      <ErrorScreen
        errorMessage={error?.message || "친구 조회에 실패했습니다."}
      />
    );
  }

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
        ListHeaderComponent={<View className="h-2" />}
        ListFooterComponent={<View className="h-4" />}
      />
    </SafeAreaView>
  );
}
