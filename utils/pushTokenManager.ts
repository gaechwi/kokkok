import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { deletePushSetting, updatePushSetting } from "./supabase";

interface UpdatePushTokenProps {
  existingToken?: string;
  handleUpdate: () => void;
}

export const isTokenValid = (token?: string | null) =>
  !!token?.startsWith("ExponentPushToken");

// 유저의 경우 토큰 업데이트
export async function updatePushToken({
  existingToken,
  handleUpdate,
}: UpdatePushTokenProps): Promise<boolean> {
  try {
    const token = await registerForPushNotificationsAsync();

    // 유저가 알림 설정 거절한 경우
    if (!token || !isTokenValid(token)) {
      // 기존에 설정이 있었다면 삭제
      if (existingToken) {
        await deletePushSetting();
        handleUpdate();
      }
      return false;
    }

    await updatePushSetting({ token });
    handleUpdate();

    return true;
  } catch (error) {
    console.error("토큰 업데이트 중 오류 발생:", error);
    return false;
  }
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Device.isDevice) {
    const isGranted = await checkAndAskPushPermission();
    if (!isGranted) return null;

    return await getPushToken();
  }

  handleRegistrationError("Must use physical device for push notifications");
  return null;
}

async function checkAndAskPushPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === "granted";
}

async function getPushToken(): Promise<string | null> {
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
  return null;
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}
