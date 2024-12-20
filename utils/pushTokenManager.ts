import { NOTIFICATION_TYPE } from "@/types/Notification.interface";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  createPushSetting,
  resetPushSetting,
  updatePushSetting,
} from "./supabase";

interface AddPushTokenProps {
  retry?: boolean;
  handleUpdate: () => void;
}

interface UpdatePushTokenProps {
  existingToken: string | null;
  retry?: boolean;
  handleUpdate: () => void;
}

interface ReRequestTokenProps {
  token?: string | null;
  handleUpdate: () => void;
}

export const isTokenValid = (token?: string | null) =>
  !!token?.startsWith("ExponentPushToken");

// 기존에 토큰이 없던 유저에게 새로운 토큰을 받아서 추가
export async function addPushToken({
  retry = false,
  handleUpdate,
}: AddPushTokenProps): Promise<boolean> {
  try {
    const token = await registerForPushNotificationsAsync(retry);
    if (!isTokenValid(token)) return false;

    await createPushSetting({
      token,
      grantedNotifications: Object.values(NOTIFICATION_TYPE),
    });
    handleUpdate();
    return true;
  } catch (error) {
    console.error(error);
  }

  return false;
}

// 기존 설정 값이 있는 유저의 경우 토큰 값만 변경
export async function updatePushToken({
  existingToken,
  retry = false,
  handleUpdate,
}: UpdatePushTokenProps): Promise<boolean> {
  try {
    const token = await registerForPushNotificationsAsync(retry);
    if (!isTokenValid(token)) {
      await resetPushSetting();
      handleUpdate();
      return false;
    }
    if (token !== existingToken) {
      await updatePushSetting({ token });
      handleUpdate();
      return true;
    }
  } catch (error) {
    console.error(error);
    await resetPushSetting();
    handleUpdate();
  }

  return false;
}

export async function reRequestToken({
  token,
  handleUpdate,
}: ReRequestTokenProps) {
  if (token !== undefined) {
    // 설정이 있었다면 토큰만 업데이트
    const isSuccess = await updatePushToken({
      existingToken: token,
      retry: true,
      handleUpdate,
    });
    if (!isSuccess) return false;
  } else {
    // 없다면 기본값 []로 새 알림 정보 생성
    const isSuccess = await addPushToken({
      retry: true,
      handleUpdate,
    });
    if (!isSuccess) return false;
  }
  return true;
}

async function registerForPushNotificationsAsync(
  retry = false,
): Promise<string | null> {
  // 안드로이드 알림 설정
  if (!retry && Platform.OS === "android") {
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
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID를 찾을 수 없습니다");
      return null;
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

  return null;
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}
