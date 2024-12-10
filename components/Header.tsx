import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";
import images from "@/constants/images";
import useCheckNewNotification from "@/hooks/useCheckNewNotification";

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
  CHANGE_PASSWORD: "비밀번호 변경",
  POST_DETAIL: "게시물",
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
  const hasNewNotification = useCheckNewNotification();

  return (
    <SafeAreaView edges={["top"]} className="border-gray-25 border-b bg-white">
      <View className="h-14 flex-row items-center justify-between px-4">
        {/* 홈의 경우 로고 이미지 사용 */}
        {name === "HOME" ? (
          <Image
            source={images.AuthLogo}
            style={{ width: 70, height: 16 }}
            accessibilityLabel="KokKok 로고"
          />
        ) : (
          <Text className="heading-2">{HEADER_TITLE[name]}</Text>
        )}

        <View className="flex-row gap-2">
          {/* 마이페이지에서만 설정 버튼 추가 */}
          {name === "MY_PAGE" && (
            <TouchableOpacity onPress={() => router.push("/setting")}>
              <icons.SettingIcon width={24} height={24} />
            </TouchableOpacity>
          )}

          {/* 새 알람 여부에 따른 아이콘 렌더링 */}
          <TouchableOpacity onPress={() => router.push("/notification")}>
            {hasNewNotification ? (
              <icons.BellWithDotIcon width={24} height={24} />
            ) : (
              <icons.BellIcon width={24} height={24} />
            )}
          </TouchableOpacity>
        </View>
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
        </View>
      </View>
    </SafeAreaView>
  );
}

export function HeaderWithUserPage({ name }: { name: string }) {
  return (
    <SafeAreaView edges={["top"]} className="border-gray-25 border-b bg-white">
      <View className="h-14 flex-row items-center gap-6 px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="뒤로가기"
          className=""
        >
          <icons.ChevronLeftIcon width={24} height={24} color="#727272" />
        </TouchableOpacity>
        <Text className="heading-2">{name}님의 페이지</Text>
      </View>
    </SafeAreaView>
  );
}

export function HeaderWithBackAndPostPage({ name }: { name: string }) {
  return (
    <SafeAreaView
      edges={[]}
      className="border-gray-25 border-b bg-white w-full"
    >
      <View className="h-14 flex-row items-center gap-6 px-4 w-full">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="뒤로가기"
        >
          <icons.ChevronLeftIcon width={24} height={24} color="#727272" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center">
          <Text
            className="heading-2 flex-shrink"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {name}
          </Text>
          <Text className="heading-2 flex-shrink-0"> 님의 게시글</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
