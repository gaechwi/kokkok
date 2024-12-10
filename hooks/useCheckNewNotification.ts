import type { User } from "@/types/User.interface";
import { getCurrentUser, getLatestNotification } from "@/utils/supabase";
import { useEffect, useState } from "react";
import useFetchData from "./useFetchData";

const useCheckNewNotification = () => {
  // 로그인한 유저 정보 조회 (마지막 알람 확인 시간)
  const { data: user } = useFetchData<User>(
    ["user", "notificationCheckedAt"],
    getCurrentUser,
    "로그인 정보 조회에 실패했습니다.",
  );

  // 유저가 받은 마지막 알람 정보 조회
  const { data: lastNotificationTime } = useFetchData<string>(
    ["lastNotification", user?.id],
    () => getLatestNotification(user?.id || ""),
    "마지막 알림 정보 조회에 실패했습니다.",
    !!user,
  );

  const [hasNewNotification, setHasNewNotification] = useState(false);
  useEffect(() => {
    if (!lastNotificationTime) return;
    if (!user?.notificationCheckedAt) {
      setHasNewNotification(true);
      return;
    }

    // 유저의 알람 확인 시간과 마지막 알람 확인 시간 비교해서 새 알람 여부 저장
    if (new Date(lastNotificationTime) > new Date(user.notificationCheckedAt)) {
      setHasNewNotification(true);
    } else {
      setHasNewNotification(false);
    }
  }, [lastNotificationTime, user]);

  return hasNewNotification;
};

export default useCheckNewNotification;
