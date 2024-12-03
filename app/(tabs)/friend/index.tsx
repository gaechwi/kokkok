import { useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FriendItem } from "@/components/FriendItem";
import FriendTab from "@/components/FriendTab";
import SearchBar from "@/components/SearchBar";
import { getFriends } from "@/utils/supabase";
import useFetchData from "@/hooks/useFetchData";
import type { FriendResponse } from "@/types/Friend.interface";
import { router } from "expo-router";

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
        <FriendTab
          isFriendTab={true}
          handlePress={() => router.replace("/friend/request")}
        />
        <View className="size-full justify-center items-center">
          <Text className="title-1">{error?.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading || !friends) {
    return (
      <SafeAreaView edges={[]} className="flex-1 bg-white">
        <FriendTab
          isFriendTab={true}
          handlePress={() => router.replace("/friend/request")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <FriendTab
        isFriendTab={true}
        handlePress={() => router.replace("/friend/request")}
      />
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
