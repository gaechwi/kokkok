import { Text, TouchableOpacity, View } from "react-native";
import icons from "@/constants/icons";
import colors from "@/constants/colors";

interface CalendarNavigatorProps {
  date: Date;
  onPrevious: () => void;
  onNext: () => void;
  isPreviousDisabled?: boolean;
  isNextDisabled?: boolean;
}

export default function CalendarNavigator({
  date,
  onPrevious,
  onNext,
  isPreviousDisabled = false,
  isNextDisabled = false,
}: CalendarNavigatorProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return (
    <View className="flex-row items-center gap-[24px]">
      {/* Previous Button */}
      <TouchableOpacity onPress={onPrevious} disabled={isPreviousDisabled}>
        <icons.ChevronLeftIcon
          width={20}
          height={20}
          color={isPreviousDisabled ? colors.gray[30] : colors.gray[90]}
        />
      </TouchableOpacity>

      {/* Month Display */}
      <Text
        className={`heading-2 text-center ${year === currentYear ? "w-[53px]" : "w-[101px]"}`}
      >
        {year === currentYear
          ? `${month}월`
          : `${String(year).slice(2)}년 ${month}월`}
      </Text>

      {/* Next Button */}
      <TouchableOpacity onPress={onNext} disabled={isNextDisabled}>
        <icons.ChevronRightIcon
          width={20}
          height={20}
          color={isNextDisabled ? colors.gray[30] : colors.gray[90]}
        />
      </TouchableOpacity>
    </View>
  );
}
