import { subscribeNotification, supabase } from "@/utils/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const useSubscribeNotification = () => {
  const queryClient = useQueryClient();

  // 나에게 오는 알림 구독
  useEffect(() => {
    let notificationChannel: RealtimeChannel;

    const handleSubscribe = async () => {
      notificationChannel = await subscribeNotification(() => {
        queryClient.invalidateQueries({ queryKey: ["notification"] });
        queryClient.invalidateQueries({ queryKey: ["lastNotification"] });
      });
    };

    handleSubscribe();
    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [queryClient.invalidateQueries]);
};

export default useSubscribeNotification;
