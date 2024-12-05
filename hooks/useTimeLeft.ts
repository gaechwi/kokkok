import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export function useTimeLeft(initialTime: number, onTimeout?: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && onTimeout) {
      onTimeout();
      setIsRunning(false);
    }

    return () => clearInterval(timer);
  }, [timeLeft, isRunning, onTimeout]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => setTimeLeft(initialTime);

  return { timeLeft, start, stop, reset };
}

export const alertExpirationOnTimeout = (path: string) => {
  Alert.alert(
    "인증 시간 만료",
    "인증 시간이 만료되었습니다. 다시 시도해주세요.",
    [
      {
        text: "확인",
        onPress: () => router.back(),
      },
    ],
  );
};
