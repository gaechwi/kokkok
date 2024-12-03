import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Friend from ".";
import Request from "./request";
import { Text } from "react-native";
import colors from "@/constants/colors";

const Tab = createMaterialTopTabNavigator();

const TabBarLabel = (title: string, focused: boolean) => (
  <Text className={`title-2 text-gray-90 ${focused ? "" : "font-pmedium"}`}>
    {title}
  </Text>
);

export default function FriendLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 64,
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
        },
      }}
    >
      <Tab.Screen
        name="index"
        component={Friend}
        options={{
          tabBarLabel: ({ focused }) => TabBarLabel("친구 목록", focused),
        }}
      />
      <Tab.Screen
        name="request"
        component={Request}
        options={{
          tabBarLabel: ({ focused }) => TabBarLabel("친구 요청", focused),
        }}
      />
    </Tab.Navigator>
  );
}
