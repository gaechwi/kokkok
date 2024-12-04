import { useState } from "react";
import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FriendItem } from "@/components/FriendItem";
import SearchBar from "@/components/SearchBar";
import { getFriends } from "@/utils/supabase";
import useFetchData from "@/hooks/useFetchData";
import type { FriendResponse } from "@/types/Friend.interface";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";
import type { UserProfile } from "@/types/User.interface";

const OFFSET = 0;
const LIMIT = 12;

interface FriendLayoutProps {
  friends: UserProfile[];
  emptyComponent: React.ReactElement;
}

function FriendLayout({ friends, emptyComponent }: FriendLayoutProps) {
  const [keyword, setKeyword] = useState("");

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <FlatList
        data={friends}
        keyExtractor={(friend) => friend.id}
        renderItem={({ item: friend }) => <FriendItem fromUser={friend} />}
        className="px-6 grow w-full"
        ListHeaderComponent={
          <SearchBar
            value={keyword}
            customClassName="mt-6 mb-2"
            handleChangeText={(newKeyword: string) => setKeyword(newKeyword)}
          />
        }
        contentContainerStyle={friends.length ? {} : { flex: 1 }}
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={<View className="h-4" />}
      />
    </SafeAreaView>
  );
}

export default function Friend() {
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
    const errorMessage = error?.message || "친구 조회에 실패했습니다.";
    return (
      <FriendLayout
        friends={[]}
        emptyComponent={<ErrorScreen errorMessage={errorMessage} />}
      />
    );
  }

  if (isLoading || !friends) {
    return <FriendLayout friends={[]} emptyComponent={<LoadingScreen />} />;
  }

  return (
    <FriendLayout
      friends={friends.data}
      emptyComponent={<ErrorScreen errorMessage="아직 친구가 없습니다." />}
    />
  );
}
