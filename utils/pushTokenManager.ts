import { NOTIFICATION_TYPE } from "@/types/Notification.interface";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Supabase from "./supabase";

export const isTokenValid = (token?: string | null) =>
  !!token?.startsWith("ExponentPushToken");

// 기존에 토큰이 없던 유저에게 새로운 토큰을 받아서 추가
export function addPushToken(userId: string, handleUpdate: () => void) {
  registerForPushNotificationsAsync()
    .then(async (token) => {
      await Supabase.createPushToken({
        userId,
        pushToken: token || null,
        grantedNotifications: Object.values(NOTIFICATION_TYPE),
      });
      handleUpdate();
    })
    .catch(async (error) => {
      await Supabase.createPushToken({
        userId,
        pushToken: error,
        grantedNotifications: [],
      });
      handleUpdate();
    });
}

// 기존 설정 값이 있는 유저의 경우 토큰 값만 변경
export function updatePushToken(
  userId: string,
  existingToken: string | null,
  handleUpdate: () => void,
) {
  registerForPushNotificationsAsync()
    .then(async (token) => {
      if (token !== existingToken) {
        await Supabase.updatePushToken({
          userId,
          pushToken: token || null,
        });
        handleUpdate();
      }
    })
    .catch(async (error) => {
      await Supabase.updatePushToken({
        userId,
        pushToken: error,
      });
      handleUpdate();
    });
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

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}
