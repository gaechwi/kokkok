import { Text, TouchableOpacity, View } from "react-native";
import { useCallback, useEffect, useState } from "react";

import { addRestDay, deleteRestDay, getRestDays } from "@/utils/supabase";

import CustomModal from "./Modal";
import CalendarNavigator from "./CalendarNavigator";
import RestDayCalendar from "./RestDayCalendar";

import icons from "@/constants/icons";
import colors from "@/constants/colors";

type RestDay = Awaited<ReturnType<typeof getRestDays>>[number];

interface RestDayModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function RestDayModal({ visible, onClose }: RestDayModalProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [defaultDates, setDefaultDates] = useState<RestDay[]>([]);
  const [restDates, setRestDates] = useState<RestDay[]>([]);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const loadRestDates = useCallback(async () => {
    try {
      const data = await getRestDays();
      setDefaultDates(data);
      setRestDates(data);
    } catch (error) {
      console.error("쉬는 날 불러오기 에러:", error);
    }
  }, []);

  useEffect(() => {
    loadRestDates();
  }, [loadRestDates]);

  const handlePreviousMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(month - 2);
    setDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(month);
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

  const handleSubmit = async () => {
    const addedDays = restDates
      .filter((rest) => !defaultDates.some((def) => def.date === rest.date))
      .map((item) => ({ date: item.date }));

    const deletedDays = defaultDates
      .filter((def) => !restDates.some((rest) => rest.date === def.date))
      .map((item) => ({ date: item.date }));

    try {
      if (addedDays.length > 0) {
        await addRestDay(addedDays);
      }
      if (deletedDays.length > 0) {
        await deleteRestDay(deletedDays);
      }
      onClose();
    } catch (error) {
      console.error("쉬는 날 설정 에러:", error);
    }
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

        <Text className="heading-1 mb-[20px]">쉬는 날을 설정하세요</Text>

        <CalendarNavigator
          date={date}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
          isPreviousDisabled={year === currentYear && month <= currentMonth}
        />

        <RestDayCalendar
          date={date}
          restDates={restDates}
          onSelectDate={handleSelectDate}
        />

        <TouchableOpacity
          className="mt-[16px] h-[52px] w-[256px] items-center justify-center rounded-[10px] bg-primary"
          onPress={handleSubmit}
        >
          <Text className="title-2 text-white">완료</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
}
