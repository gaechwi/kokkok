import {
	View,
	Text,
	ScrollView,
	Image,
	TouchableOpacity,
	TextInput,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useRouter } from "expo-router";

import images from "../../../constants/images";

const Step1 = () => {
	const router = useRouter();

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			className="h-full flex-1 bg-white"
		>
			<ScrollView>
				<View className="mt-10 flex items-center justify-center px-6">
					<Image
						source={images.AuthLogo}
						className="h-[90px] w-[328px]"
						resizeMode="contain"
					/>

					<View className="mt-10 flex w-full gap-8">
						<TextInput
							className="h-[58px] w-full rounded-[10px] border border-gray-20 px-4 focus:border-primary"
							placeholder="이메일을 입력해주세요."
							keyboardType="email-address"
							autoCapitalize="none"
							accessibilityLabel="이메일 입력"
							accessibilityHint="이메일을 입력해주세요."
						/>

						<TextInput
							className="h-[58px] w-full rounded-[10px] border border-gray-20 px-4 focus:border-primary"
							placeholder="비밀번호를 입력해주세요."
							secureTextEntry
							accessibilityLabel="비밀번호 입력"
							accessibilityHint="비밀번호를 입력해주세요."
						/>

						<TextInput
							className="h-[58px] w-full rounded-[10px] border border-gray-20 px-4 focus:border-primary"
							placeholder="비밀번호를 한번 더 입력해주세요"
							secureTextEntry
							accessibilityLabel="비밀번호 재입력"
							accessibilityHint="비밀번호를 한번 더 입력해주세요"
						/>
					</View>

					<TouchableOpacity
						className="mt-10 h-[62px] w-full items-center justify-center rounded-[10px] bg-primary"
						onPress={() => router.push("/sign-up/step2")}
					>
						<Text className="heading-2 text-white">계속하기</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default Step1;
