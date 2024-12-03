import { Text, View } from "react-native";
import icons from "@/constants/icons";

// FIXME: 타입 수정 필요
interface WorkoutCalendarProps {
  date: Date;
  workoutStatuses: { date: string; status: "DONE" | "REST" }[];
}

export default function WorkoutCalendar({
  date,
  workoutStatuses,
}: WorkoutCalendarProps) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const days = Array.from(
    { length: firstDayOfMonth + daysInMonth },
    (_, index) => {
      if (index < firstDayOfMonth) return null;

      const day = index - firstDayOfMonth + 1;
      const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
        day,
      ).padStart(2, "0")}`;
      const status =
        workoutStatuses.find((ws) => ws.date.split("T")[0] === formattedDate)
          ?.status ?? null;

      return { day, status };
    },
  );

  // 마지막 주의 빈 공간을 null로 채우기
  const totalDays = Math.ceil(days.length / 7) * 7;
  for (let i = days.length; i < totalDays; i++) {
    days.push(null);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getIcon = (day: number, status: "DONE" | "REST" | null) => {
    const today = new Date();
    const targetDate = new Date(year, month - 1, day);

    if (status === "REST") {
      return <icons.FaceRestIcon width={30} height={30} />;
    }

    if (status === "DONE") {
      return <icons.FaceDoneIcon width={30} height={30} />;
    }

    if (targetDate > today) {
      return <icons.FaceDefaultIcon width={30} height={30} />;
    }

    return <icons.FaceNotDoneIcon width={30} height={30} />;
  };

  return (
    <View className="w-full">
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
            key={week ? `${year}-${month}-${weekIndex}` : `empty-${weekIndex}`}
            className="mt-[8px] flex-row items-center justify-between"
          >
            {week.map((day, dayIndex) => (
              <View
                key={day ? `${year}-${month}-${day.day}` : `empty-${dayIndex}`}
                className="w-[30px] items-center justify-start"
              >
                {day ? (
                  <View className="items-center justify-center gap-[8px]">
                    <Text className="body-4 text-gray-65">{day.day}</Text>
                    {getIcon(day.day, day.status)}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
