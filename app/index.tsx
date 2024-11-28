import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
// noUnusedImports 확인
import { Text, View } from "react-native";

export default function App() {
	return (
		<View className="flex-1 text-white items-center justify-center">
			{/* useSortedClasses 확인 */}
			<Text className="font-bold text-3xl">여러분들 진짜 대단해요</Text>
			<View className="flex-row gap-2">
				<Link href="/home">home</Link>
				<Link href="/profile">profile</Link>
			</View>
			<StatusBar style="auto" />
		</View>
	);
}
