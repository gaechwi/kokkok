import { StatusBar } from "expo-status-bar";
// noUnusedImports 확인
import { Text, View } from "react-native";

export default function App() {
	return (
		<View className="flex-1 items-center justify-center">
			{/* useSortedClasses 확인 */}
			<Text className="font-pblack text-3xl">여러분들 진짜 대단해요</Text>
			<StatusBar style="auto" />
		</View>
	);
}
