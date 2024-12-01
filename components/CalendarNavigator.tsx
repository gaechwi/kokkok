import { Text, TouchableOpacity, View } from "react-native";
import icons from "@/constants/icons";
import colors from "@/constants/colors";

interface CalendarNavigatorProps {
  className?: string;
  children: React.ReactNode;
}

function CalendarNavigator({
  className = "",
  children,
}: CalendarNavigatorProps) {
  return (
    <View className={`${className} flex-row items-center gap-[24px]`}>
      {children}
    </View>
  );
}

interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

function PreviousButton({ onPress, disabled = false }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <icons.ChevronLeftIcon
        width={20}
        height={20}
        color={disabled ? colors.gray[30] : colors.gray[90]}
      />
    </TouchableOpacity>
  );
}

function NextButton({ onPress, disabled = false }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <icons.ChevronRightIcon
        width={20}
        height={20}
        color={disabled ? colors.gray[30] : colors.gray[90]}
      />
    </TouchableOpacity>
  );
}

interface MonthDisplayProps {
  className?: string;
  date: Date;
}

function MonthDisplay({ className = "", date }: MonthDisplayProps) {
  const currentYear = new Date().getFullYear();

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return (
    <Text
      className={`${className} heading-2 text-center ${year === currentYear ? "w-[43px]" : "w-[87px]"}`}
    >
      {year === currentYear
        ? `${month}월`
        : `${String(year).slice(2)}년 ${month}월`}
    </Text>
  );
}

CalendarNavigator.PreviousButton = PreviousButton;
CalendarNavigator.NextButton = NextButton;
CalendarNavigator.MonthDisplay = MonthDisplay;

export default CalendarNavigator;
