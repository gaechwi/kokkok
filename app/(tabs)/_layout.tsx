import { Tabs } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";
import HomeIcon from "@assets/icons/Home.svg";
import BellIcon from "@assets/icons/bell.svg";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#333333",
        tabBarInactiveTintColor: "#828282",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E1E1E1",
          height: 64,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          header: () => (
            <SafeAreaView className="border-gray-25 border-b bg-white">
              <View className="h-14 flex-row items-center justify-between px-4">
                <Text className="font-bold text-xl">Home</Text>
                <TouchableOpacity>
                  <BellIcon width={24} height={24} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          ),
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View className="w-fit flex-col items-center justify-center gap-2">
              <HomeIcon width={24} height={24} color={color} />
              <Text className="font-bold text-xs" style={{ color }}>
                Home
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
