import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NotificationItem } from "@/components/NotificationItem";
import useFetchData from "@/hooks/useFetchData";
import type { Session } from "@supabase/supabase-js";
import {
  getCurrentSession,
  getNotifications,
  supabase,
} from "@/utils/supabase";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";
import type { NotificationResponse } from "@/types/Notification.interface";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
          <ErrorScreen errorMessage="친구 요청이 없습니다." />
        }
      />
    </SafeAreaView>
  );
}
