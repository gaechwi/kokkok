import { useAuthSession } from "@/hooks/useAuthSession";
import useFetchData from "@/hooks/useFetchData";
import type { PushSetting } from "@/types/Notification.interface";
import { addPushToken, updatePushToken } from "@/utils/pushTokenManager";
import { getPushSetting, resetPushSetting } from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

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

  const { isLoggedIn } = useAuthSession(queryClient);
  const [isInit, setIsInit] = useState(true);
  const [pushPermission, setPushPermission] = useState("");

  // 기존 푸시 알림 정보 조회
  const { data: pushSetting, isPending: isTokenPending } =
    useFetchData<PushSetting | null>(
      ["pushToken"],
      () => getPushSetting(),
      "푸시 알림 설정 정보 로드에 실패했습니다.",
    );

  // 세션 바뀔 때마다 isInit true로 바꿈
  useEffect(() => {
    if (!isLoggedIn) return;
    setIsInit(true);
  }, [isLoggedIn]);

  // 로그인 한 첫회에만 푸시 토큰 업데이트
  useEffect(() => {
    if (!isLoggedIn || isTokenPending || !isInit) return;

    // 푸시알람 관련 정보 업데이트 시 캐시된 데이터 삭제, 더이상 첫 업데이트 아님을 마킹
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["pushToken"] });
      setIsInit(false);
    };

    if (pushSetting?.userId) {
      updatePushToken({
        existingToken: pushSetting.token,
        handleUpdate,
      });
    } else {
      addPushToken({ handleUpdate });
    }
  }, [
    isLoggedIn,
    isTokenPending,
    pushSetting?.userId,
    pushSetting?.token,
    isInit,
    queryClient,
  ]);

  // 푸시 알림 관련 포스트 페이지로 바로 이동
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { data } = response.notification.request.content;
        if (!Object.keys(data).length) {
          // 찌르기
          router.navigate("/home");
        } else if (data.postId) {
          // 게시글 댓글, 좋아요, 멘션, 댓글 좋아요 알림
          router.navigate(`/post/${data.postId}`);
        } else {
          if (data.isAccepted) {
            // 친구 수락
            router.navigate("/friend");
          } else {
            // 친구 요청
            router.navigate("/friend/request");
          }
        }
      },
    );

    return () => subscription.remove();
  }, []);

  // 권한 설정 변경 감지
  useEffect(() => {
    // 앱 푸시알림 설정 변경 시 관련 정보 리패치
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["pushToken"] });
    };

    // 권한 설정 정보 저장
    const handlePermissionChange = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === pushPermission || !isLoggedIn) return;
      setPushPermission(status);

      if (status === "granted") {
        await updatePushToken({ existingToken: null, handleUpdate });
      } else {
        await resetPushSetting();
        handleUpdate();
      }
    };

    // 앱이 foreground 로 돌아왔을 때 권한변경 감지
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        handlePermissionChange();
      }
    });

    return () => subscription.remove();
  }, [pushPermission, isLoggedIn, queryClient]);

  return children;
}
