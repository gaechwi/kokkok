import useFetchData from "@/hooks/useFetchData";
import type { PushSetting } from "@/types/Notification.interface";
import { addPushToken, updatePushToken } from "@/utils/pushTokenManager";
import { getCurrentSession, getPushSetting } from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";

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
  const [isInit, setIsInit] = useState(true);

  // 로그인한 유저 정보 조회
  const { data: session } = useFetchData<Session>(
    ["session"],
    getCurrentSession,
    "로그인 정보 조회에 실패했습니다.",
  );

  // 기존 푸시 알림 정보 조회
  const { data: pushSetting, isPending: isTokenPending } =
    useFetchData<PushSetting | null>(
      ["pushToken"],
      () => getPushSetting(session?.user.id || ""),
      "푸시 알림 설정 정보 로드에 실패했습니다.",
      !!session,
    );

  // 푸시알람 관련 정보 업데이트 시 캐시된 데이터 삭제, 더이상 첫 업데이트 아님을 마킹
  const handleUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["pushToken"] });
    queryClient.invalidateQueries({ queryKey: ["pushTokenSetting"] });
    setIsInit(false);
  }, [queryClient]);

  // 세션 바뀔 때마다 isInit true로 바꿈
  useEffect(() => {
    if (!session) return;
    setIsInit(true);
  }, [session]);

  // session과 token 유효하고, 로그인 한 첫회에만 푸시 토큰 업데이트
  useEffect(() => {
    if (!session || isTokenPending) return;
    if (!isInit) return;

    const userId = session.user.id;
    if (pushSetting) {
      updatePushToken({
        userId,
        existingToken: pushSetting.token,
        handleUpdate,
      });
    } else {
      addPushToken({ userId, handleUpdate });
    }
  }, [session, pushSetting, isTokenPending, isInit, handleUpdate]);

  // 푸시 알림 관련 포스트 페이지로 바로 이동
  useEffect(() => {
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

  return children;
}
