import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import icons from "@/constants/icons";

const HEADER_TITLE = {
  LOGIN: "로그인",
  RESET_PASSWORD: "비밀번호 초기화",
  SIGNUP: "회원가입",
  EDIT_PROFILE: "프로필 수정",
  SETTING: "계정 설정",
  UPLOAD: "인증하기",
  NOTIFICATION: "알림",
  HOME: "KokKok",
  MY_PAGE: "마이페이지",
  HISTORY: "기록",
  FRIEND: "친구",
} as const;
type HeaderType = keyof typeof HEADER_TITLE;

interface HeaderProps {
  name: HeaderType;
}

export function Header({ name }: HeaderProps) {
  return (
    <SafeAreaView edges={["top"]} className="border-gray-25 border-b bg-white">
      <View className="h-14 items-center justify-center">
        <Text className="heading-2">{HEADER_TITLE[name]}</Text>
      </View>
    </SafeAreaView>
  );
}

export function HeaderWithBack({ name }: HeaderProps) {
  return (
    <SafeAreaView edges={["top"]} className="border-gray-25 border-b bg-white">
      <View className="h-14 items-center justify-center px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="뒤로가기"
          className="absolute left-4"
        >
          <icons.ChevronLeftIcon width={24} height={24} color="#727272" />
        </TouchableOpacity>
        <Text className="heading-2">{HEADER_TITLE[name]}</Text>
      </View>
    </SafeAreaView>
  );
}

export function HeaderWithNotification({ name }: HeaderProps) {
  return (
    <SafeAreaView edges={["top"]} className="border-gray-25 border-b bg-white">
      <View className="h-14 flex-row items-center justify-between px-4">
        <Text className="heading-2">{HEADER_TITLE[name]}</Text>
        <TouchableOpacity onPress={() => router.push("/notification")}>
          <icons.BellIcon width={24} height={24} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function HeaderWithSettingAndNotification({ name }: HeaderProps) {
  return (
    <SafeAreaView edges={["top"]} className="border-gray-25 border-b bg-white">
      <View className="h-14 flex-row items-center justify-between px-4">
        <Text className="heading-2">{HEADER_TITLE[name]}</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={() => router.push("/setting")}>
            <icons.SettingIcon width={24} height={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/notification")}>
            <icons.BellIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
