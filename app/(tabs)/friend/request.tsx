import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FriendRequest } from "@/components/FriendItem";
import { getFriendRequests } from "@/utils/supabase";
import useFetchData from "@/hooks/useFetchData";
import type { RequestResponse } from "@/types/Friend.interface";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";

const OFFSET = 0;
const LIMIT = 12;

export default function Request() {
  const {
    data: requests,
    isLoading,
    error,
  } = useFetchData<RequestResponse>(
    ["friendRequests", OFFSET],
    () => getFriendRequests({ offset: OFFSET, limit: LIMIT }),
    "친구 요청 조회에 실패했습니다.",
  );

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
      <ScrollView className="px-8 grow w-full">
        {/* 상단에 패딩을 주면 일부 모바일에서 패딩만큼 끝이 잘려보여서 높이 조절을 위해 추가 */}
        <View className="h-2" />
        {requests.data.map((request) => (
          <FriendRequest key={request.requestId} {...request} />
        ))}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
