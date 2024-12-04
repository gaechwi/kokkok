import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Friend from ".";
import Request from "./request";
import { Text } from "react-native";
import colors from "@/constants/colors";

const Tab = createMaterialTopTabNavigator();

const SCREEN_OPTIONS = {
  tabBarStyle: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "transparent",
    borderBottomColor: colors.gray[20],
    borderBottomWidth: 1,
  },
  tabBarIndicatorStyle: {
    backgroundColor: colors.primary,
  },
} as const;

const TabBarLabel = (title: string, focused: boolean) => (
  <Text className={`title-2 text-gray-90 ${focused ? "" : "font-pmedium"}`}>
    {title}
  </Text>
);

export default function FriendLayout() {
  return (
    <Tab.Navigator screenOptions={SCREEN_OPTIONS}>
      <Tab.Screen
        name="index"
        component={Friend}
        options={{
          tabBarLabel: ({ focused }) => TabBarLabel("친구 목록", focused),
          tabBarAccessibilityLabel: "친구 목록 탭",
        }}
      />
      <Tab.Screen
        name="request"
        component={Request}
        options={{
          tabBarLabel: ({ focused }) => TabBarLabel("친구 요청", focused),
          tabBarAccessibilityLabel: "친구 요청 탭",
        }}
      />
    </Tab.Navigator>
  );
}
