import useFetchData from "@/hooks/useFetchData";
import type { PushToken } from "@/types/Notification.interface";
import {
  createPushToken,
  getCurrentSession,
  getPushToken,
  updatePushToken,
} from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

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
  const [expoPushToken, setExpoPushToken] = useState("");
  const queryClient = useQueryClient();

  // 로그인한 유저 정보 조회
  const { data: session } = useFetchData<Session>(
    ["session"],
    getCurrentSession,
    "로그인 정보 조회에 실패했습니다.",
  );

  const { data: token } = useFetchData<PushToken>(
    ["pushToken", session?.user.id],
    () => getPushToken(session?.user.id || ""),
    "푸시 알림 설정 정보 로드에 실패했습니다.",
    !!session,
  );

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error) => setExpoPushToken(`${error}`));
  }, []);

  useEffect(() => {
    if (!session || !expoPushToken) return;
    const userId = session.user.id;

    // 새로 토큰 등록하는 경우
    if (!token) {
      createPushToken({
        userId,
        pushToken: expoPushToken,
        grantedNotifications: [
          "comment",
          "commentLike",
          "like",
          "poke",
          "mention",
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["pushToken", userId] });
      return;
    }

    // 토큰 값이 달라진 경우
    if (token?.pushToken !== expoPushToken) {
      updatePushToken({ userId, pushToken: expoPushToken });
      queryClient.invalidateQueries({ queryKey: ["pushToken", userId] });
    }
  }, [session, token, expoPushToken, queryClient.invalidateQueries]);

  return children;
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  // 안드로이드 알림 설정
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    // 권한 받기
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError("푸시 알림 권한 설정이 필요합니다!");
      return;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID를 찾을 수 없습니다");
    }

    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}
