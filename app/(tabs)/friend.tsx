import { useState } from "react";
import FriendTab from "@/components/FriendTab";
import { View, ScrollView } from "react-native";
import SearchBar from "@/components/SearchBar";
import { FriendItem, FriendRequest } from "@/components/FriendItem";

/* mock data와 type */

interface User {
  accountId: string;
  nickname: string;
  avatar: string;
  description: string;
  status: "DONE" | "NOT_DONE" | "REST";
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
    status: "NOT_DONE",
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
  const [isFriendTap, setIsFriendTap] = useState(true);
  const [keyword, setKeyword] = useState("");

  return (
    <View className="bg-white">
      <FriendTab
        isFriendTap={isFriendTap}
        handlePress={(newIsFriendTab: boolean) =>
          setIsFriendTap(newIsFriendTab)
        }
      />
      {isFriendTap ? (
        <ScrollView className="px-6 pt-6 h-full w-full">
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
        <ScrollView className="px-6 pt-2 h-full w-full">
          {[1, 2, 3, 4, 5].map((n) =>
            USERS.toReversed().map((user) => (
              <FriendRequest key={n + user.accountId} {...user} />
            )),
          )}
        </ScrollView>
      )}
    </View>
  );
}
