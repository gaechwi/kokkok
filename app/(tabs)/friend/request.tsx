import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FriendRequest } from "@/components/FriendItem";
import FriendTab from "@/components/FriendTab";
import { USERS } from "@/mockData/user";
import { router } from "expo-router";

/* 실제 컴포넌트 */

export default function Friend() {
  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <FriendTab
        isFriendTab={false}
        handlePress={() => router.replace("/friend")}
      />

      <ScrollView className="px-8 grow w-full">
        {/* 상단에 패딩을 주면 일부 모바일에서 패딩만큼 끝이 잘려보여서 높이 조절을 위해 추가 */}
        <View className="h-2" />
        {[1, 2, 3, 4, 5].map((n) =>
          USERS.map((user) => (
            <FriendRequest key={n + user.accountId} {...user} />
          )),
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
