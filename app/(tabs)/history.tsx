import {
  ScrollView,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
} from "react-native";
import { useState } from "react";
import SetRestDayModal from "@/components/SetRestDayModal";
import CalendarNavigator from "@/components/CalendarNavigator";
import WorkoutCalendar from "@/components/WorkoutCalendar";
import icons from "@/constants/icons";

type Status = "DONE" | "REST";
interface Mock {
  date: string;
  status: Status;
}
const mock: Mock[] = [
  { date: "2024-11-01T00:00:00.000Z", status: "DONE" },
  { date: "2024-11-02T00:00:00.000Z", status: "REST" },
  { date: "2024-11-05T00:00:00.000Z", status: "REST" },
  { date: "2024-11-08T00:00:00.000Z", status: "DONE" },
  { date: "2024-11-14T00:00:00.000Z", status: "DONE" },
  { date: "2024-11-15T00:00:00.000Z", status: "DONE" },
  { date: "2024-11-16T00:00:00.000Z", status: "DONE" },
  { date: "2024-11-19T00:00:00.000Z", status: "DONE" },
  { date: "2024-11-20T00:00:00.000Z", status: "REST" },
  { date: "2024-11-24T00:00:00.000Z", status: "DONE" },
  { date: "2024-11-25T00:00:00.000Z", status: "DONE" },
  { date: "2024-11-28T00:00:00.000Z", status: "DONE" },
  { date: "2024-11-29T00:00:00.000Z", status: "REST" },
  { date: "2024-11-30T00:00:00.000Z", status: "DONE" },
  { date: "2024-12-01T00:00:00.000Z", status: "DONE" },
  { date: "2024-12-10T00:00:00.000Z", status: "REST" },
  { date: "2024-12-13T00:00:00.000Z", status: "DONE" },
];

export default function History() {
  const [date, setDate] = useState<Date>(new Date());
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const isNextDisabled = year === currentYear && month >= currentMonth;

  const workoutDays = mock.filter(
    (item) =>
      Number(item.date.split("-")[1]) === month && item.status === "DONE",
  ).length;

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

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <ScrollView className="flex-1 bg-white px-[24px] pt-[18px]">
      <View className="flex-row items-center">
        <Text className="heading-1 grow">
          {month}월 <Text className="text-primary">{workoutDays}</Text>일 운동
          완료!
        </Text>

        <SetRestDayButton onPress={openModal} />
        <SetRestDayModal visible={isModalOpen} onClose={closeModal} />
      </View>

      <View className="mt-[20px] items-center rounded-[10px] border border-gray-25 px-[16px] pt-[16px] pb-[32px]">
        <CalendarNavigator>
          <CalendarNavigator.PreviousButton onPress={handlePreviousMonth} />
          <CalendarNavigator.MonthDisplay date={date} />
          <CalendarNavigator.NextButton
            onPress={handleNextMonth}
            disabled={isNextDisabled}
          />
        </CalendarNavigator>
        <WorkoutCalendar date={date} workoutStatus={mock} />
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
          <View key={label} className="w-[32px] items-center">
            {icon}
            <Text className="caption-3">{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
