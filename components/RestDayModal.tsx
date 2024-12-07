import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import useCalendar from "@/hooks/useCalendar";

import { formatDate } from "@/utils/formatDate";
import { addRestDay, deleteRestDay, getRestDays } from "@/utils/supabase";

import CalendarNavigator from "./CalendarNavigator";
import CustomModal from "./Modal";
import RestDayCalendar from "./RestDayCalendar";

import colors from "@/constants/colors";
import icons from "@/constants/icons";
import { showToast } from "./ToastConfig";

type RestDay = Awaited<ReturnType<typeof getRestDays>>[number];

interface RestDayModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function RestDayModal({ visible, onClose }: RestDayModalProps) {
  const {
    date,
    year,
    month,
    currentYear,
    currentMonth,
    changeMonth,
    resetDate,
  } = useCalendar();
  const [restDates, setRestDates] = useState<RestDay[]>([]);

  const { data: defaultDates = [], isSuccess } = useQuery({
    queryKey: ["restDates"],
    queryFn: getRestDays,
  });

  const queryClient = useQueryClient();
  const { mutate: handleSubmit } = useMutation({
    mutationFn: async () => {
      const addedDays = restDates
        .filter((rest) => !defaultDates.some((def) => def.date === rest.date))
        .map((item) => ({ date: item.date }));

      const deletedDays = defaultDates
        .filter((def) => !restDates.some((rest) => rest.date === def.date))
        .map((item) => ({ date: item.date }));

      if (addedDays.length > 0) {
        await addRestDay(addedDays);
      }
      if (deletedDays.length > 0) {
        await deleteRestDay(deletedDays);
      }
      handleClose();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["restDates"] });
    },
    onError: () => {
      showToast("fail", "쉬는 날 설정에 실패했어요!");
    },
  });

  const handleClose = () => {
    onClose();
    setRestDates(defaultDates);
    resetDate();
  };

  const handlePreviousMonth = () => {
    changeMonth(-1);
  };
  const handleNextMonth = () => {
    changeMonth(1);
  };

  useEffect(() => {
    if (isSuccess) {
      setRestDates(defaultDates);
    }
  }, [isSuccess, defaultDates]);

  const handleSelectDate = (date: Date) => {
    const formattedDate = formatDate(date) as `${number}-${number}-${number}`;

    setRestDates((prev) => {
      const exists = prev.some((rd) => rd.date === formattedDate);

      if (exists) {
        return prev.filter((rd) => rd.date !== formattedDate);
      }
      return [...prev, { date: formattedDate }];
    });
  };

  return (
    <CustomModal visible={visible} onClose={handleClose} position="bottom">
      <View className="items-center px-[39px] pt-[40px] pb-[52px]">
        <TouchableOpacity
          className="absolute top-[16px] right-[16px]"
          onPress={handleClose}
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
          onPress={() => {
            handleSubmit();
          }}
        >
          <Text className="title-2 text-white">완료</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
}
