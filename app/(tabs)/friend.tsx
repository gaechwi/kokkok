import { useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FriendItem, FriendRequest } from "@/components/FriendItem";
import FriendTab from "@/components/FriendTab";
import SearchBar from "@/components/SearchBar";
import { USERS } from "@/mockData/user";

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
            USERS.map((user) => (
              <FriendRequest key={n + user.accountId} {...user} />
            )),
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
