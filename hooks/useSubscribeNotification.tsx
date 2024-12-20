import { supabase } from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

const useSubscribeNotification = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  // 유저 아이디 불러오기
  useEffect(() => {
    const handleLoadId = async () => {
      setUserId(await SecureStore.getItemAsync("userId"));
    };

    handleLoadId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    // 나에게 오는 알림 구독
    const notificationChannel = supabase
      .channel("notification")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification",
          filter: `to=eq.${userId}`,
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
  }, [userId, queryClient.invalidateQueries]);
};

export default useSubscribeNotification;
