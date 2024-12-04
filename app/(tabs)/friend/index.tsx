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

const OFFSET = 0;
const LIMIT = 12;

interface FriendLayoutProps {
  keyword: string;
  onChangeText: (newKeyworkd: string) => void;
  children: React.ReactNode;
}

function FriendLayout({ keyword, onChangeText, children }: FriendLayoutProps) {
  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-6">
        <SearchBar value={keyword} handleChangeText={onChangeText} />
        {children}
      </View>
    </SafeAreaView>
  );
}

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
      <FriendLayout
        keyword={keyword}
        onChangeText={(newKeyword: string) => setKeyword(newKeyword)}
      >
        <ErrorScreen
          errorMessage={error?.message || "친구 조회에 실패했습니다."}
        />
      </FriendLayout>
    );
  }

  if (isLoading || !friends) {
    return (
      <FriendLayout
        keyword={keyword}
        onChangeText={(newKeyword: string) => setKeyword(newKeyword)}
      >
        <LoadingScreen />
      </FriendLayout>
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <FlatList
        data={friends.data}
        keyExtractor={(friend) => friend.id}
        renderItem={({ item: friend }) => (
          <FriendItem key={friend.id} fromUser={friend} />
        )}
        className="px-6 grow w-full"
        ListHeaderComponent={
          <SearchBar
            value={keyword}
            customClassName="mt-6"
            handleChangeText={(newKeyword: string) => setKeyword(newKeyword)}
          />
        }
        ListFooterComponent={<View className="h-4" />}
      />
    </SafeAreaView>
  );
}
