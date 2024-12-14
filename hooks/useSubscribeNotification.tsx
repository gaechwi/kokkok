import { getCurrentSession, supabase } from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import useFetchData from "./useFetchData";

const useSubscribeNotification = () => {
  const queryClient = useQueryClient();

  const { data: session } = useFetchData<Session>(
    ["session"],
    getCurrentSession,
    "로그인 정보 조회에 실패했습니다.",
  );

  useEffect(() => {
    if (!session) return;

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
};

export default useSubscribeNotification;
