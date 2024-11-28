import {
	ScrollView,
	Text,
	View,
	Image,
	TextInput,
	TouchableOpacity,
} from "react-native";
import images from "../../constants/images";

const SignIn = () => {
	return (
		<View className="h-full bg-white">
			<ScrollView>
				<View className="mt-10 flex items-center justify-center px-6">
					<Image
						source={images.authLogo}
						className="h-[90px] w-[328px]"
						resizeMode="contain"
					/>

					<View className="mt-10 flex w-full gap-8">
						<TextInput
							className="h-[58px] w-full rounded-[10px] border border-gray-20 px-4 focus:border-primary"
							placeholder="이메일을 입력해주세요."
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						<TextInput
							className="h-[58px] w-full rounded-[10px] border border-gray-20 px-4 focus:border-primary"
							placeholder="비밀번호를 입력해주세요."
							secureTextEntry
						/>
					</View>

					<TouchableOpacity className="mt-10 h-[62px] w-full items-center justify-center rounded-[10px] bg-primary">
						<Text className="heading-2 text-white">로그인</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

export default SignIn;
