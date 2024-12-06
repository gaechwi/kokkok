import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NotificationItem } from "@/components/NotificationItem";
import useFetchData from "@/hooks/useFetchData";
import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  getCurrentSession,
  getNotifications,
  supabase,
  updateNotificationCheck,
} from "@/utils/supabase";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";
import type { NotificationResponse } from "@/types/Notification.interface";

export default function Notification() {
  const queryClient = useQueryClient();

  const { data: session, error: userError } = useFetchData<Session>(
    ["session"],
    getCurrentSession,
    "로그인 정보 조회에 실패했습니다.",
  );

  const {
    data: notifications,
    isLoading,
    error: notificationError,
  } = useFetchData<NotificationResponse[]>(
    ["notification"],
    () => getNotifications(session?.user.id || ""),
    "알림 조회에 실패했습니다.",
    !!session?.user,
  );

  useEffect(() => {
    if (!session) return;

    // 알림 페이지 방문 시간 업데이트하고, 그에 따라 유저 정보 다시 가져오도록 함
    updateNotificationCheck(session.user.id);
    queryClient.invalidateQueries({ queryKey: ["user"] });

    // 나에게 오는 알림 구독
    const notificationChannel = supabase
      .channel("notification")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification",
          filter: `to=eq.${session.user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notification"] });
          queryClient.invalidateQueries({ queryKey: ["lastNotification"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [session, queryClient.invalidateQueries]);

  if (userError || notificationError) {
    const errorMessage =
      userError?.message ||
      notificationError?.message ||
      "알림 조회에 실패했습니다.";
    return <ErrorScreen errorMessage={errorMessage} />;
  }

  if (isLoading || !notifications) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <FlatList
        data={notifications}
        keyExtractor={(notification) => notification.id}
        renderItem={({ item: notification }) => (
          <NotificationItem {...notification} />
        )}
        className="px-8 grow w-full"
        contentContainerStyle={notifications.length ? {} : { flex: 1 }}
        ListHeaderComponent={<View className="h-2" />}
        ListFooterComponent={<View className="h-[34px]" />}
        ListEmptyComponent={
          <ErrorScreen errorMessage="새로운 알림이 없습니다." />
        }
      />
    </SafeAreaView>
  );
}
