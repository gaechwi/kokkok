import { StatusBar } from "expo-status-bar";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import icons from "../../constants/icons";

export default function History() {
	const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

	return (
		<View className="flex-1 gap-5 bg-white px-7 py-6">
			<View className="flex-row items-center">
				<Text className="grow font-bold text-[23px] leading-normal">
					11월 <Text className="text-primary">17</Text>일 운동 완료!
				</Text>

				<TouchableOpacity className="h-[36px] w-[85px] items-center justify-center rounded-lg border border-gray-25">
					<Text className="font-normal text-[13px] text-gray-90 leading-normal">
						쉬는 날 설정
					</Text>
				</TouchableOpacity>
			</View>

			<View className="items-center rounded-[10px] border border-gray-25 px-6 pt-4 pb-8">
				<View className="mb-4 flex-row items-center gap-6">
					<TouchableOpacity>
						<icons.ArrowLeftIcon width={20} height={20} color="#5D5D5D" />
					</TouchableOpacity>
					<Text className="font-bold text-xl leading-normal">11월</Text>
					<TouchableOpacity>
						<icons.ArrowRightIcon width={20} height={20} color="#5D5D5D" />
					</TouchableOpacity>
				</View>

				<View className="mt-6 flex-row">
					{["일", "월", "화", "수", "목", "금", "토"].map((day) => (
						<Text
							key={day}
							className="flex-1 text-center font-medium text-[13px] text-gray-65"
						>
							{day}
						</Text>
					))}
				</View>

				<FlatList
					data={daysInMonth}
					numColumns={7}
					keyExtractor={(item) => item.toString()}
					renderItem={({ item }) => (
						<View className="mt-2 flex w-[14.28%] items-center justify-center gap-2">
							<Text className="font-medium text-[13px] text-gray-65">
								{item}
							</Text>
							<icons.FaceDefaultIcon width={32} height={32} />
						</View>
					)}
					scrollEnabled={false}
				/>
			</View>

			<View className="flex-row items-center rounded-[10px] border border-gray-25 px-[25px] py-[15px]">
				<Text className="font-medium text-base leading-normal">
					표정의 의미는?
				</Text>
				<View className="ml-auto flex-row gap-2">
					<View className="w-[33px] items-center">
						<icons.FaceDefaultIcon width={24} height={24} />
						<Text className="font-normal text-[10px] leading-normal">기본</Text>
					</View>
					<View className="w-[33px] items-center">
						<icons.FaceDoneIcon width={24} height={24} />
						<Text className="font-normal text-[10px] leading-normal">
							운동함
						</Text>
					</View>
					<View className="w-[33px] items-center">
						<icons.FaceNotDoneIcon width={24} height={24} />
						<Text className="font-normal text-[10px] leading-normal">안함</Text>
					</View>
					<View className="w-[33px] items-center">
						<icons.FaceRestIcon width={24} height={24} />
						<Text className="font-normal text-[10px] leading-normal">
							쉬는 날
						</Text>
					</View>
				</View>
			</View>

			<StatusBar style="auto" />
		</View>
	);
}
