import { OTP_TIME } from "@/constants/time";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

export function useTimeLeft() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(OTP_TIME);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      Alert.alert(
        "인증 시간 만료",
        "인증 시간이 만료되었습니다. 다시 시도해주세요.",
        [
          {
            text: "확인",
            onPress: () => router.replace("/sign-up/step1"),
          },
        ],
      );
    }
  }, [timeLeft, router]);

  return timeLeft;
}
