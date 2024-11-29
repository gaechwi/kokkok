import { StatusBar } from "expo-status-bar";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import icons from "../../constants/icons";

export default function History() {
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <View className="flex-1 gap-[20px] bg-white px-[28px] py-[24px]">
      <View className="flex-row items-center">
        <Text className="heading-1 grow">
          11월 <Text className="text-primary">17</Text>일 운동 완료!
        </Text>

        <TouchableOpacity className="h-[36px] w-[85px] items-center justify-center rounded-[8px] border border-gray-25">
          <Text className="body-5 text-gray-90">쉬는 날 설정</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center rounded-[10px] border border-gray-25 px-[24px] pt-[16px] pb-[32px]">
        <View className="mb-[16px] flex-row items-center gap-[24px]">
          <TouchableOpacity>
            <icons.ArrowLeftIcon width={20} height={20} color="#5D5D5D" />
          </TouchableOpacity>
          <Text className="heading-2">11월</Text>
          <TouchableOpacity>
            <icons.ArrowRightIcon width={20} height={20} color="#5D5D5D" />
          </TouchableOpacity>
        </View>

        <View className="mt-[24px] flex-row">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <Text key={day} className="body-4 flex-1 text-center text-gray-65">
              {day}
            </Text>
          ))}
        </View>

        <FlatList
          data={daysInMonth}
          numColumns={7}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <View className="mt-[8px] flex w-[14.28%] items-center justify-center gap-[8px]">
              <Text className="body-4 text-gray-65">{item}</Text>
              <icons.FaceDefaultIcon width={32} height={32} />
            </View>
          )}
          scrollEnabled={false}
        />
      </View>

      <View className="flex-row items-center rounded-[10px] border border-gray-25 px-[25px] py-[15px]">
        <Text className="title-4">표정의 의미는?</Text>
        <View className="ml-auto flex-row gap-[8px]">
          <View className="w-[32px] items-center">
            <icons.FaceDefaultIcon width={24} height={24} />
            <Text className="caption-3">기본</Text>
          </View>
          <View className="w-[32px] items-center">
            <icons.FaceDoneIcon width={24} height={24} />
            <Text className="caption-3">운동함</Text>
          </View>
          <View className="w-[32px] items-center">
            <icons.FaceNotDoneIcon width={24} height={24} />
            <Text className="caption-3">안함</Text>
          </View>
          <View className="w-[32px] items-center">
            <icons.FaceRestIcon width={24} height={24} />
            <Text className="caption-3">쉬는 날</Text>
          </View>
        </View>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}
