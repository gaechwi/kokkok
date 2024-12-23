import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export function useTimerWithDuration(duration: number, onTimeout?: () => void) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && onTimeout) {
      onTimeout();
    }

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);

  return { timeLeft };
}

export function useTimerWithStartAndDuration(onTimeout?: () => void) {
  const [expiration, setExpiration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // expiration과 현재 시간 차이를 초로 계산
  const calculateTimeLeft = useCallback(() => {
    if (!expiration) return 0;

    const now = Date.now();
    return Math.max(0, Math.floor((expiration - now) / 1000));
  }, [expiration]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
    } else if (onTimeout) {
      onTimeout();
    }

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout, calculateTimeLeft]);

  const start = useCallback(
    (start: number, duration: number) => {
      // expiration이 유효하지 않거나 현재보다 작으면 실행 X
      const expiration = start + duration;
      if (!expiration || expiration <= Date.now()) return;

      setExpiration(expiration);
      setTimeLeft(calculateTimeLeft());
    },
    [calculateTimeLeft],
  );

  return { timeLeft, start };
}

export const alertExpirationOnTimeout = () => {
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
