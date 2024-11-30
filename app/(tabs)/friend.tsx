import { useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FriendItem, FriendRequest } from "@/components/FriendItem";
import FriendTab from "@/components/FriendTab";
import SearchBar from "@/components/SearchBar";

/* mock data와 type */

interface User {
  accountId: string;
  nickname: string;
  avatar: string;
  description: string;
  status?: "DONE" | "REST";
}

const USERS: User[] = [
  {
    accountId: "1",
    nickname: "개발자",
    avatar:
      "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1730962073092-thumbnail.webp",
    description: "블로그 개발자입니다.",
    status: "DONE",
  },
  {
    accountId: "2",
    nickname: "개발자2",
    avatar:
      "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1731427831515-thumbnail.webp",
    description: "저도 블로그 개발자입니다.",
  },
  {
    accountId: "3",
    nickname: "개발자3",
    avatar:
      "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1731865249691-thumbnail.webp",
    description: "블로그 개발자입니다.",
    status: "REST",
  },
];

/* 실제 컴포넌트 */

export default function Friend() {
  const [isFriendTab, setIsFriendTab] = useState(true);
  const [keyword, setKeyword] = useState("");

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
            {[1, 2, 3, 4, 5].map((n) =>
              USERS.map((user) => (
                <FriendItem key={n + user.accountId} {...user} />
              )),
            )}
          </View>
        </ScrollView>
      ) : (
        <ScrollView className="px-8 grow w-full">
          {/* 상단에 패딩을 주면 일부 모바일에서 패딩만큼 끝이 잘려보여서 높이 조절을 위해 추가 */}
          <View className="h-2" />
          {[1, 2, 3, 4, 5].map((n) =>
            USERS.toReversed().map((user) => (
              <FriendRequest key={n + user.accountId} {...user} />
            )),
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
