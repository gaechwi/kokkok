import { useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FriendItem } from "@/components/FriendItem";
import SearchBar from "@/components/SearchBar";
import { getFriends } from "@/utils/supabase";
import useFetchData from "@/hooks/useFetchData";
import type { FriendResponse } from "@/types/Friend.interface";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";

const OFFSET = 0;
const LIMIT = 12;

export default function Friend() {
  const [keyword, setKeyword] = useState("");

  const {
    data: friends,
    isLoading,
    error,
  } = useFetchData<FriendResponse>(
    ["friends", OFFSET],
    () => getFriends({ offset: OFFSET, limit: LIMIT }),
    "친구 조회에 실패했습니다.",
  );

  if (error) {
    return (
      <SafeAreaView edges={[]} className="flex-1 bg-white">
        <View className="px-6 pt-6">
          <SearchBar
            value={keyword}
            handleChangeText={(newKeyword: string) => setKeyword(newKeyword)}
          />
        </View>
        <ErrorScreen
          errorMessage={error?.message || "친구 조회에 실패했습니다."}
        />
      </SafeAreaView>
    );
  }

  if (isLoading || !friends) {
    return (
      <SafeAreaView edges={[]} className="flex-1 bg-white">
        <View className="px-6 pt-6">
          <SearchBar
            value={keyword}
            handleChangeText={(newKeyword: string) => setKeyword(newKeyword)}
          />
        </View>
        <LoadingScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <ScrollView className="px-6 grow w-full">
        {/* 상단에 패딩을 주면 일부 모바일에서 패딩만큼 끝이 잘려보여서 높이 조절을 위해 추가 */}
        <View className="h-6" />

        <SearchBar
          value={keyword}
          handleChangeText={(newKeyword: string) => setKeyword(newKeyword)}
        />

        <View className="px-2 pt-2">
          {friends.data.map((friend) => (
            <FriendItem key={friend.id} fromUser={friend} />
          ))}
        </View>

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
