import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import Calendar from "@/components/Calendar";
import icons from "@/constants/icons";

export default function History() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const month = currentDate.getMonth() + 1;

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
          {month}월 <Text className="text-primary">17</Text>일 운동 완료!
        </Text>

        <TouchableOpacity className="h-[36px] w-[85px] items-center justify-center rounded-[8px] border border-gray-25">
          <Text className="body-5 text-gray-90">쉬는 날 설정</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-[20px] items-center rounded-[10px] border border-gray-25 px-[16px] pt-[16px] pb-[32px]">
        <CalendarNavigator
          date={currentDate}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
        />
        <Calendar date={currentDate} />
      </View>

      <FaceExplanation />
    </ScrollView>
  );
}

interface CalendarNavigatorProps {
  date: Date;
  onPrevious: () => void;
  onNext: () => void;
}

function CalendarNavigator({
  date,
  onPrevious,
  onNext,
}: CalendarNavigatorProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const isNextDisabled = year === currentYear && month >= currentMonth;

  return (
    <View className="flex-row items-center gap-[24px]">
      {/* Previous Button */}
      <TouchableOpacity onPress={onPrevious}>
        <icons.ChevronLeftIcon width={20} height={20} color="#5D5D5D" />
      </TouchableOpacity>

      {/* Month Display */}
      <Text className="heading-2">
        {year === currentYear
          ? `${month}월`
          : `${String(year).slice(2)}년 ${month}월`}
      </Text>

      {/* Next Button */}
      <TouchableOpacity onPress={onNext} disabled={isNextDisabled}>
        <icons.ChevronRightIcon
          width={20}
          height={20}
          color={isNextDisabled ? "#CCCCCC" : "#5D5D5D"}
        />
      </TouchableOpacity>
    </View>
  );
}

function FaceExplanation() {
  const faces = [
    { icon: <icons.FaceDefaultIcon width={24} height={24} />, label: "기본" },
    { icon: <icons.FaceDoneIcon width={24} height={24} />, label: "운동함" },
    { icon: <icons.FaceNotDoneIcon width={24} height={24} />, label: "안함" },
    { icon: <icons.FaceRestIcon width={24} height={24} />, label: "쉬는 날" },
  ];

  return (
    <View className="mt-[8px] mb-[18px] flex-row items-center rounded-[10px] border border-gray-25 px-[27px] py-[16px]">
      <Text className="title-4">표정의 의미는?</Text>

      <View className="ml-auto flex-row gap-[8px]">
        {faces.map(({ icon, label }) => (
          <View key={label} className="w-[32px] items-center">
            {icon}
            <Text className="caption-3">{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
