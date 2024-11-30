import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NOTIFICATIONS } from "@/mockData/notification";
import { NotificationItem } from "@/components/NotificationItem";

export default function Notification() {
  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <ScrollView className="grow w-full">
        {/* 상단에 패딩을 주면 일부 모바일에서 패딩만큼 끝이 잘려보여서 높이 조절을 위해 추가 */}
        <View className="h-2" />

        {[1, 2, 3, 4].map((n) =>
          NOTIFICATIONS.map((notification) => (
            <NotificationItem key={n + notification.id} {...notification} />
          )),
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
