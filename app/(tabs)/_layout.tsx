import { Tabs } from "expo-router";
import {
	SafeAreaView,
	Text,
	View,
	StatusBar,
	Platform,
	TouchableOpacity,
} from "react-native";
import HomeIcon from "../../assets/icons/Home.svg";
import BellIcon from "../../assets/icons/bell.svg";

export default function TabsLayout() {
	const platform = Platform.OS;

	const statusBarHeight = platform === "android" ? StatusBar.currentHeight : 0;

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
					height: 70,
				},
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					header: () => (
						<SafeAreaView
							style={{
								paddingTop: statusBarHeight,
								height: 56 + (statusBarHeight ?? 0),
							}}
							className="flex-row items-center justify-between border-gray-25 border-b bg-white pr-[14px] pl-4"
						>
							<Text className="font-bold text-xl">Home</Text>
							<TouchableOpacity>
								<BellIcon width={24} height={24} />
							</TouchableOpacity>
						</SafeAreaView>
					),
					title: "Home",
					tabBarIcon: ({ color }) => (
						<View className="w-fit flex-col items-center justify-center gap-2">
							<HomeIcon width={24} height={24} stroke={color} />
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
