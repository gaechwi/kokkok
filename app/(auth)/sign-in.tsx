import {
	ScrollView,
	Text,
	View,
	Image,
	TextInput,
	TouchableOpacity,
} from "react-native";

import images from "@constants/images";
import icons from "@constants/icons";
import { useState } from "react";

const SignIn = () => {
	const [showPassword, setShowPassword] = useState(false);

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
							accessibilityLabel="이메일 입력"
							accessibilityHint="이메일을 입력해주세요."
						/>
						<View className="w-full">
							<TextInput
								className="h-[58px] w-full rounded-[10px] border border-gray-20 px-4 focus:border-primary"
								placeholder="비밀번호를 입력해주세요."
								secureTextEntry={!showPassword}
								accessibilityLabel="비밀번호 입력"
								accessibilityHint="비밀번호를 입력해주세요."
							/>
							<TouchableOpacity
								className="-translate-y-1/2 absolute top-1/2 right-4"
								onPress={() => setShowPassword((prev) => !prev)}
								accessibilityLabel={
									showPassword ? "비밀번호 숨기기" : "비밀번호 표시"
								}
								accessibilityRole="button"
							>
								{showPassword ? (
									<icons.EyeOffIcon width={24} height={24} color="#828282" />
								) : (
									<icons.EyeIcon width={24} height={24} color="#828282" />
								)}
							</TouchableOpacity>
						</View>
					</View>

					<TouchableOpacity className="mt-10 h-[62px] w-full items-center justify-center rounded-[10px] bg-primary">
						<Text className="heading-2 text-white">로그인</Text>
					</TouchableOpacity>

					<View className="mt-10 flex flex-row justify-center gap-3">
						<Text className="body-1 text-gray-50">비밀번호 찾기</Text>
						<Text className="body-1 text-gray-50">|</Text>
						<Text className="body-1 text-gray-50">회원가입</Text>
					</View>

					<View className="mt-14 flex items-center">
						<View>
							<Text className="title-3 text-gray-65">간편 로그인</Text>
						</View>
						<View className="mt-4 flex-row items-center gap-4">
							<icons.GithubIcon width={56} height={56} />
							<icons.KakaoIcon width={56} height={56} />
							<icons.GoogleIcon width={56} height={56} />
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

export default SignIn;