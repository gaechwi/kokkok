import { Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import CustomModal from "./Modal";
import CalendarNavigator from "./CalendarNavigator";
import RestDayCalendar from "./RestDayCalendar";
import icons from "@/constants/icons";
import colors from "@/constants/colors";

// FIXME: 타입 수정 필요
interface Mock {
  date: `${number}-${number}-${number}`;
}
const mock: Mock[] = [
  { date: "2024-12-01" },
  { date: "2024-12-08" },
  { date: "2024-12-14" },
  { date: "2024-12-20" },
  { date: "2024-12-25" },
  { date: "2024-12-29" },
  { date: "2025-01-02" },
  { date: "2025-01-04" },
  { date: "2025-01-05" },
  { date: "2025-01-11" },
  { date: "2025-01-12" },
];

interface RestDayModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (restDates: Mock[]) => void;
}

export default function RestDayModal({
  visible,
  onClose,
  onSubmit,
}: RestDayModalProps) {
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
    ).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}` as `${number}-${number}-${number}`;

    setRestDates((prev) => {
      const exists = prev.some((rd) => rd.date === formattedDate);

      if (exists) {
        return prev.filter((rd) => rd.date !== formattedDate);
      }
      return [...prev, { date: formattedDate }];
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

        <Text className="heading-1 mb-[8px]">쉬는 날을 설정하세요</Text>

        <CalendarNavigator
          date={date}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
          isPreviousDisabled={isPreviousDisabled}
        />

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
