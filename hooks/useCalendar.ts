import { useCallback, useState } from "react";

export default function useCalendar() {
  const [date, setDate] = useState<Date>(new Date());

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const changeMonth = (offset: number) => {
    const newDate = new Date(date);
    newDate.setMonth(month - 1 + offset);
    setDate(newDate);
  };

  const resetDate = useCallback(() => {
    setDate(new Date());
  }, []);

  return {
    date,
    year,
    month,
    currentDate,
    currentYear,
    currentMonth,
    changeMonth,
    resetDate,
  };
}
