import {
  ScrollView,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
} from "react-native";
import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import useCalendar from "@/hooks/useCalendar";
import useModal from "@/hooks/useModal";

import { getHistories } from "@/utils/supabase";

import RestDayModal from "@/components/RestDayModal";
import CalendarNavigator from "@/components/CalendarNavigator";
import WorkoutCalendar from "@/components/WorkoutCalendar";

import icons from "@/constants/icons";

type History = Awaited<ReturnType<typeof getHistories>>[number];

export default function History() {
  const {
    date,
    year,
    month,
    currentYear,
    currentMonth,
    changeMonth,
    resetDate,
  } = useCalendar();
  const { isModalVisible, openModal, closeModal } = useModal();

  const { data: histories = [], refetch } = useQuery({
    queryKey: ["histories", year, month],
    queryFn: () => getHistories(year, month),
  });

  const handlePreviousMonth = () => {
    changeMonth(-1);
  };
  const handleNextMonth = () => {
    changeMonth(1);
  };

  useFocusEffect(
    useCallback(() => {
      resetDate();
      refetch();
    }, [refetch, resetDate]),
  );

  const workoutDays = histories.filter(
    (item) =>
      new Date(item.date).getMonth() + 1 === month && item.status === "done",
  ).length;

  return (
    <ScrollView className="flex-1 bg-white px-[24px] pt-[18px]">
      <View className="flex-row items-center">
        <Text className="heading-1 grow">
          {month}월 <Text className="text-primary">{workoutDays}</Text>일 운동
          완료!
        </Text>

        <SetRestDayButton onPress={openModal} />
        <RestDayModal visible={isModalVisible} onClose={closeModal} />
      </View>

      <View className="mt-[20px] items-center rounded-[10px] border border-gray-25 px-[16px] pt-[16px] pb-[32px]">
        <CalendarNavigator
          date={date}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
          isNextDisabled={year === currentYear && month >= currentMonth}
        />
        <WorkoutCalendar date={date} workoutStatuses={histories} />
      </View>

      <FaceExplanation />
    </ScrollView>
  );
}

function SetRestDayButton({ onPress }: TouchableOpacityProps) {
  return (
    <TouchableOpacity
      className="h-[36px] w-[85px] items-center justify-center rounded-[8px] border border-gray-25"
      onPress={onPress}
    >
      <Text className="body-5 text-gray-90">쉬는 날 설정</Text>
    </TouchableOpacity>
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
          <View key={label} className="w-[34px] items-center">
            {icon}
            <Text className="caption-3">{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
