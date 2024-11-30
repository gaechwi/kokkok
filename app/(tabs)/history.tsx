import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import icons from "@/constants/icons";
import { useState } from "react";

export default function History() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const daysArray = Array.from(
    { length: firstDayOfMonth + daysInMonth },
    (_, index) => {
      if (index < firstDayOfMonth) return null;
      return index - firstDayOfMonth + 1;
    },
  );

  // 마지막 주의 빈 공간을 null로 채우기
  const totalDays = Math.ceil(daysArray.length / 7) * 7;
  for (let i = daysArray.length; i < totalDays; i++) {
    daysArray.push(null);
  }

  const weeks = [];
  for (let i = 0; i < daysArray.length; i += 7) {
    weeks.push(daysArray.slice(i, i + 7));
  }

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  return (
    <ScrollView className="flex-1 bg-white px-[24px] pt-[18px]">
      <View className="flex-row items-center">
        <Text className="heading-1 grow">
          {currentMonth}월 <Text className="text-primary">17</Text>일 운동 완료!
        </Text>

        <TouchableOpacity className="h-[36px] w-[85px] items-center justify-center rounded-[8px] border border-gray-25">
          <Text className="body-5 text-gray-90">쉬는 날 설정</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-[20px] items-center rounded-[10px] border border-gray-25 px-[16px] pt-[16px] pb-[32px]">
        <View className="flex-row items-center gap-[24px]">
          <TouchableOpacity onPress={handlePreviousMonth}>
            <icons.ChevronLeftIcon width={20} height={20} color="#5D5D5D" />
          </TouchableOpacity>
          <Text className="heading-2">{currentMonth}월</Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <icons.ChevronRightIcon width={20} height={20} color="#5D5D5D" />
          </TouchableOpacity>
        </View>

        <View className="mt-[24px] w-full flex-row justify-between px-[12px]">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <Text key={day} className="body-4 text-center text-gray-65">
              {day}
            </Text>
          ))}
        </View>

        <View className="w-full px-[3px]">
          {weeks.map((week, weekIndex) => (
            <View
              key={
                week
                  ? `${currentYear}-${currentMonth}-${week}`
                  : `empty-${weekIndex}`
              }
              className="mt-[8px] flex-row items-center justify-between"
            >
              {week.map((day, dayIndex) => (
                <View
                  key={
                    day
                      ? `${currentYear}-${currentMonth}-${day}`
                      : `empty-${dayIndex}`
                  }
                  className="w-[30px] items-center justify-start"
                >
                  {day ? (
                    <View className="items-center justify-center gap-[8px]">
                      <Text className="body-4 text-gray-65">{day}</Text>
                      <icons.FaceDefaultIcon width={30} height={30} />
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      <View className="mt-[8px] mb-[18px] flex-row items-center rounded-[10px] border border-gray-25 px-[27px] py-[16px]">
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
    </ScrollView>
  );
}
