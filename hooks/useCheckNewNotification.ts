import type { User } from "@/types/User.interface";
import { getCurrentUser, getLatestNotification } from "@/utils/supabase";
import { useEffect, useState } from "react";
import useFetchData from "./useFetchData";

const useCheckNewNotification = () => {
  // 로그인한 유저 정보 조회 (마지막 알람 확인 시간)
  const { data: currentUser } = useFetchData<User>(
    ["notificationCheckedAt"],
    getCurrentUser,
    "로그인 정보 조회에 실패했습니다.",
  );

  // 유저가 받은 마지막 알람 정보 조회
  const { data: lastNotificationTime } = useFetchData<string>(
    ["lastNotification"],
    () => getLatestNotification(),
    "마지막 알림 정보 조회에 실패했습니다.",
  );

  const [hasNewNotification, setHasNewNotification] = useState(false);
  useEffect(() => {
    if (!lastNotificationTime) return;
    if (!currentUser?.notificationCheckedAt) {
      setHasNewNotification(true);
      return;
    }

    // 유저의 알람 확인 시간과 마지막 알람 확인 시간 비교해서 새 알람 여부 저장
    if (
      new Date(lastNotificationTime) >
      new Date(currentUser.notificationCheckedAt)
    ) {
      setHasNewNotification(true);
    } else {
      setHasNewNotification(false);
    }
  }, [lastNotificationTime, currentUser]);

  return hasNewNotification;
};

export default useCheckNewNotification;
