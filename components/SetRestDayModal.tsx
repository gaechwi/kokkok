import { Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import CustomModal from "./Modal";
import CalendarNavigator from "./CalendarNavigator";
import RestDayCalendar from "./RestDayCalendar";
import icons from "@/constants/icons";
import colors from "@/constants/colors";

// FIXME: 타입 수정 필요
interface Mock {
  date: string;
}
const mock: Mock[] = [
  { date: "2024-12-01T00:00:00.000Z" },
  { date: "2024-12-08T00:00:00.000Z" },
  { date: "2024-12-14T00:00:00.000Z" },
  { date: "2024-12-20T00:00:00.000Z" },
  { date: "2024-12-25T00:00:00.000Z" },
  { date: "2024-12-29T00:00:00.000Z" },
  { date: "2025-01-02T00:00:00.000Z" },
  { date: "2025-01-04T00:00:00.000Z" },
  { date: "2025-01-05T00:00:00.000Z" },
  { date: "2025-01-11T00:00:00.000Z" },
  { date: "2025-01-12T00:00:00.000Z" },
];

interface SetRestDayModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (restDates: Mock[]) => void;
}

export default function SetRestDayModal({
  visible,
  onClose,
  onSubmit,
}: SetRestDayModalProps) {
  const [date, setDate] = useState<Date>(new Date());
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [restDates, setRestDates] = useState<Mock[]>(mock);

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

  const handleSelectDate = (date: Date) => {
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    setRestDates((prev) => {
      const exists = prev.some((rd) => rd.date.split("T")[0] === formattedDate);

      if (exists) {
        return prev.filter((rd) => rd.date.split("T")[0] !== formattedDate);
      }
      return [...prev, { date: `${formattedDate}T00:00:00.000Z` }];
    });
  };

  const handleSubmit = () => {
    onSubmit(restDates);
    onClose();
  };

  return (
    <CustomModal visible={visible} onClose={onClose} position="bottom">
      <View className="items-center px-[39px] pt-[40px] pb-[52px]">
        <TouchableOpacity
          className="absolute top-[16px] right-[16px]"
          onPress={onClose}
        >
          <icons.XIcon width={24} height={24} color={colors.gray[90]} />
        </TouchableOpacity>

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

        <RestDayCalendar
          date={date}
          restDates={restDates}
          onSelectDate={handleSelectDate}
        />

        <TouchableOpacity
          className="mt-[44px] h-[52px] w-[256px] items-center justify-center rounded-[10px] bg-primary"
          onPress={handleSubmit}
        >
          <Text className="title-2 text-white">완료</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
}
