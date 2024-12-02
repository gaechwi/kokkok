import { useCallback, useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FriendItem, FriendRequest } from "@/components/FriendItem";
import FriendTab from "@/components/FriendTab";
import SearchBar from "@/components/SearchBar";
import { getFriendRequests, getFriends } from "@/utils/supabase";

/* 실제 컴포넌트 */

const OFFSET = 0;
const LIMIT = 12;

export default function Friend() {
  const [isFriendTab, setIsFriendTab] = useState(true);
  const [keyword, setKeyword] = useState("");

  const [friends, setFriends] = useState<
    Awaited<ReturnType<typeof getFriends>>
  >({
    data: [],
    total: 0,
    hasMore: false,
  });
  const [requests, setRequests] = useState<
    Awaited<ReturnType<typeof getFriendRequests>>
  >({
    data: [],
    total: 0,
    hasMore: false,
  });

  const fetchFriends = useCallback(async () => {
    const fetchedFriends = await getFriends({
      offset: OFFSET,
      limit: LIMIT,
    });
    setFriends(fetchedFriends);
  }, []);

  const fetchRequests = useCallback(async () => {
    const fetchedRequests = await getFriendRequests({
      offset: OFFSET,
      limit: LIMIT,
    });
    setRequests(fetchedRequests);
  }, []);

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [fetchFriends, fetchRequests]);

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <FriendTab
        isFriendTab={isFriendTab}
        handlePress={(newIsFriendTab: boolean) =>
          setIsFriendTab(newIsFriendTab)
        }
      />
      {isFriendTab ? (
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
      ) : (
        <ScrollView className="px-8 grow w-full">
          {/* 상단에 패딩을 주면 일부 모바일에서 패딩만큼 끝이 잘려보여서 높이 조절을 위해 추가 */}
          <View className="h-2" />
          {requests.data.map((request) => (
            <FriendRequest key={request.requestId} {...request} />
          ))}
          <View className="h-4" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
