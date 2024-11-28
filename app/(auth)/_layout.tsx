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
			</Stack>
			<StatusBar style="dark" />
		</>
	);
};

export default AuthLayout;
