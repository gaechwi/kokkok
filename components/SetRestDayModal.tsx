import { Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import CustomModal from "./Modal";
import CalendarNavigator from "./CalendarNavigator";
import icons from "@/constants/icons";
import colors from "@/constants/colors";

interface SetRestDayModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SetRestDayModal({
  visible,
  onClose,
}: SetRestDayModalProps) {
  const [date, setDate] = useState<Date>(new Date());
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const isPreviousDisabled = year === currentYear && month <= currentMonth;

  const handlePreviousMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() - 1);
    setDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + 1);
    setDate(newDate);
  };

  return (
    <CustomModal visible={visible} onClose={onClose} position="bottom">
      <View className="relative items-center px-[39px] pt-[40px] pb-[52px]">
        <icons.XIcon
          className="absolute top-[16px] right-[16px]"
          width={24}
          height={24}
          color={colors.gray[90]}
        />

        <Text className="heading-1">쉬는 날을 설정하세요</Text>

        <CalendarNavigator className="mt-[21px] gap-[16px]">
          <CalendarNavigator.PreviousButton
            onPress={handlePreviousMonth}
            disabled={isPreviousDisabled}
          />
          <CalendarNavigator.MonthDisplay
            className="text-gray-40"
            date={date}
          />
          <CalendarNavigator.NextButton onPress={handleNextMonth} />
        </CalendarNavigator>

        <Text>일월화수목금토</Text>
        <Text>12</Text>
        <Text>3456789</Text>
        <Text>3456789</Text>
        <Text>3456789</Text>
        <Text>3456789</Text>

        <TouchableOpacity className="mt-[44px] h-[52px] w-[256px] items-center justify-center rounded-[10px] bg-primary">
          <Text className="title-2 text-white">완료</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
}
