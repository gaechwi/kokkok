import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import icons from "../../constants/icons";
import { useRouter } from "expo-router";

const AuthLayout = () => {
	const router = useRouter();

	return (
		<>
			<Stack>
				<Stack.Screen
					name="sign-in"
					options={{
						header: () => (
							<SafeAreaView edges={["top"]} className="bg-white">
								<View className="flex size-full h-14 items-center justify-center border-gray-25 border-b ">
									<Text
										className="heading-2"
										accessibilityRole="header"
										accessibilityLabel="로그인 화면"
									>
										로그인
									</Text>
								</View>
							</SafeAreaView>
						),
					}}
				/>
				<Stack.Screen
					name="sign-up/step1"
					options={{
						header: () => (
							<SafeAreaView edges={["top"]} className="bg-white">
								<View className="flex h-14 flex-row items-center border-gray-25 border-b px-4">
									<TouchableOpacity
										onPress={() => router.back()}
										accessibilityLabel="뒤로가기"
										className="absolute left-4 z-10"
									>
										<icons.ChevronLeftIcon
											width={24}
											height={24}
											color="#727272"
										/>
									</TouchableOpacity>
									<View className="flex-1 items-center">
										<Text className="heading-2">회원가입</Text>
									</View>
								</View>
							</SafeAreaView>
						),
					}}
				/>
				<Stack.Screen
					name="sign-up/step2"
					options={{
						header: () => (
							<SafeAreaView edges={["top"]} className="bg-white">
								<View className="flex h-14 flex-row items-center border-gray-25 border-b px-4">
									<TouchableOpacity
										onPress={() => router.back()}
										accessibilityLabel="뒤로가기"
										className="absolute left-4 z-10"
									>
										<icons.ChevronLeftIcon
											width={24}
											height={24}
											color="#727272"
										/>
									</TouchableOpacity>
									<View className="flex-1 items-center">
										<Text className="heading-2">회원가입</Text>
									</View>
								</View>
							</SafeAreaView>
						),
					}}
				/>
			</Stack>
			<StatusBar style="dark" />
		</>
	);
};

export default AuthLayout;
