import useFetchData from "@/hooks/useFetchData";
import type { PushToken } from "@/types/Notification.interface";
import { addPushToken, updatePushToken } from "@/utils/pushTokenManager";
import { getCurrentSession, getPushToken } from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

interface Props {
  children: React.ReactNode;
}

export default function NotificationProvider({ children }: Props) {
  const queryClient = useQueryClient();

  // 로그인한 유저 정보 조회
  const { data: session } = useFetchData<Session>(
    ["session"],
    getCurrentSession,
    "로그인 정보 조회에 실패했습니다.",
  );

  // 기존 푸시 알림 정보 조회
  const { data: token, isPending: isTokenPending } =
    useFetchData<PushToken | null>(
      ["pushToken"],
      () => getPushToken(session?.user.id || ""),
      "푸시 알림 설정 정보 로드에 실패했습니다.",
      !!session,
    );

  const handleUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["pushToken"] });
    queryClient.invalidateQueries({ queryKey: ["pushTokenData"] });
  }, [queryClient]);

  useEffect(() => {
    // 푸시 알림 관련 포스트 페이지로 바로 이동
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { data } = response.notification.request.content;
        if (!data) {
          // 찌르기나 친구 요청 수락 알림
          router.navigate("/friend");
        } else {
          // 게시글 댓글, 좋아요, 멘션, 댓글 좋아요 알림
          router.navigate(`/post/${data.postId}`);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!session || isTokenPending) return;

    if (token) {
      updatePushToken(session.user.id, token.pushToken, handleUpdate);
    } else {
      addPushToken(session.user.id, handleUpdate);
    }
  }, [session, token, isTokenPending, handleUpdate]);

  return children;
}
