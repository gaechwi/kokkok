import { router, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@constants/icons";
import colors from "@constants/colors";

/* constants */

const TAP_ICONS = {
  home: (color: string) => (
    <icons.HomeIcon width={24} height={24} color={color} />
  ),
  friend: (color: string) => (
    <icons.FriendIcon width={24} height={24} color={color} />
  ),
  history: (color: string) => (
    <icons.CalendarIcon width={24} height={24} color={color} />
  ),
  mypage: (color: string) => (
    <icons.ProfileIcon width={24} height={24} color={color} />
  ),
} as const;
type TapType = keyof typeof TAP_ICONS;

const TAP_NAME = {
  home: "홈",
  friend: "친구",
  history: "기록",
  mypage: "마이",
};

const HEADER_TITLE = {
  home: "KokKok",
  friend: "친구",
  history: "기록",
  mypage: "마이페이지",
};

/* components */

const TabIcon = ({
  color,
  name,
}: {
  color: string;
  name: TapType;
}) => (
  <View className="w-fit items-center justify-center gap-0">
    {TAP_ICONS[name](color)}
    <Text className="caption-1" style={{ color }}>
      {TAP_NAME[name]}
    </Text>
  </View>
);

const Header = ({ name }: { name: TapType }) => (
  <SafeAreaView edges={["top"]} className="border-gray-25 border-b bg-white">
    <View className="h-14 flex-row items-center justify-between px-4">
      <Text className="heading-2">{HEADER_TITLE[name]}</Text>
      {/* 마이페이지는 설정 버튼 추가 */}
      <TouchableOpacity>
        <icons.BellIcon width={24} height={24} />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

export default function TabsLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.gray[90],
          tabBarInactiveTintColor: colors.gray[55],
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.gray[20],
            height: 80,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            paddingBottom: Platform.OS === "android" ? 24 : 16,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            header: () => <Header name="home" />,
            title: "Home",
            tabBarIcon: ({ color }) => <TabIcon color={color} name="home" />,
          }}
        />
        <Tabs.Screen
          name="friend"
          options={{
            header: () => <Header name="friend" />,
            title: "Friend",
            tabBarIcon: ({ color }) => <TabIcon color={color} name="friend" />,
          }}
        />
        <Tabs.Screen
          name="upload"
          options={{
            title: "인증하기",
            tabBarStyle: { display: "none" },
            header: () => (
              <SafeAreaView className="border-gray-25 border-b bg-white">
                <View className="relative h-14 w-full flex-row items-center justify-between px-4">
                  <TouchableOpacity
                    onPress={() => router.back()}
                    className="-translate-y-1/2 absolute top-1/2 left-3 z-10"
                  >
                    <icons.BackIcon
                      width={24}
                      height={24}
                      color={colors.gray[60]}
                    />
                  </TouchableOpacity>

                  <Text className="heading-2 w-full text-center">인증하기</Text>
                </View>
              </SafeAreaView>
            ),
            tabBarIcon: () => (
              <View className="size-12 items-center justify-center rounded-full bg-primary p-3">
                <icons.PlusIcon width={24} height={24} color={colors.white} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            header: () => <Header name="history" />,
            title: "History",
            tabBarIcon: ({ color }) => <TabIcon color={color} name="history" />,
          }}
        />
        <Tabs.Screen
          name="mypage"
          options={{
            header: () => <Header name="mypage" />,
            title: "MyPage",
            tabBarIcon: ({ color }) => <TabIcon color={color} name="mypage" />,
          }}
        />
      </Tabs>

      <StatusBar style="auto" />
    </>
  );
}
