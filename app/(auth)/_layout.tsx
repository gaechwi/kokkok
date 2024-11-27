import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

const AuthLayout = () => {
	return (
		<>
			<Stack>
				<Stack.Screen
					name="sign-in"
					options={{
						header: () => (
							<SafeAreaView className="border-gray-25 border-b bg-white">
								<View className="flex h-14 items-center justify-center">
									<Text className="heading-2">로그인</Text>
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
