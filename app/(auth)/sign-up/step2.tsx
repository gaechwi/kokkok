import {
	View,
	Text,
	ScrollView,
	Image,
	TouchableOpacity,
	TextInput,
} from "react-native";
import images from "../../../constants/images";

const Step2 = () => {
	return (
		<View className="h-full bg-white">
			<ScrollView>
				<View className="mt-10 flex items-center justify-center px-6">
					<TouchableOpacity>
						<Image
							source={images.AvatarInput}
							className="size-[236px]"
							resizeMode="contain"
						/>
					</TouchableOpacity>

					<View className="mt-10 flex w-full gap-10">
						<TextInput
							className="h-[58px] w-full rounded-[10px] border border-gray-20 px-4 focus:border-primary"
							placeholder="닉네임을 입력해주세요."
							accessibilityLabel="닉네임 입력"
							accessibilityHint="닉네임을 입력해주세요."
						/>
						<TextInput
							className="h-[108px] w-full rounded-[10px] border border-gray-20 p-4 focus:border-primary"
							placeholder="소개글을 입력해주세요."
							accessibilityLabel="소개글 입력"
							accessibilityHint="소개글을 입력해주세요."
							multiline={true} // 여러 줄 입력 가능
							numberOfLines={4} // 기본 표시 줄 수
						/>
					</View>

					<TouchableOpacity className="mt-12 h-[62px] w-full items-center justify-center rounded-[10px] bg-primary">
						<Text className="heading-2 text-white">완료</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

export default Step2;
