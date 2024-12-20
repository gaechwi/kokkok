import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import ErrorScreen from "@/components/ErrorScreen";
import { FriendItem } from "@/components/FriendItem";
import LoadingScreen from "@/components/LoadingScreen";
import { SearchLayout } from "@/components/SearchLayout";
import useFetchData from "@/hooks/useFetchData";
import type { StatusInfo } from "@/types/Friend.interface";
import type { UserProfile } from "@/types/User.interface";
import { debounce } from "@/utils/DelayManager";
import { formatDate } from "@/utils/formatDate";
import { getFriends, getFriendsStatus, supabase } from "@/utils/supabase";
import { useFocusEffect } from "expo-router";

export default function Friend() {
  const queryClient = useQueryClient();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [keyword, setKeyword] = useState("");

  // 유저의 친구 정보 조회
  const {
    data: friendsData,
    isLoading: isFriendLoading,
    error: friendError,
  } = useFetchData<UserProfile[]>(
    ["friends", keyword],
    () => getFriends(keyword),
    "친구 조회에 실패했습니다.",
  );

  const friendIds = friendsData?.map((friend) => friend.id);

  // 친구의 운동 상태 정보 조회
  const {
    data: statusData,
    isLoading: isStatusLoading,
    error: statusError,
  } = useFetchData<StatusInfo[]>(
    ["friends", "status"],
    () => getFriendsStatus(friendIds || []),
    "친구 조회에 실패했습니다.",
    !!friendIds?.length,
  );

  const handleKeywordChange = debounce((newKeyword: string) => {
    setKeyword(newKeyword);
  }, 200);

  // 친구창에 focus 들어올 때마다 친구목록 새로고침 (검색중일 때 제외)
  useFocusEffect(() => {
    if (!keyword) {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    }
  });

  // 친구의 운동 정보가 바뀌면 쿼리 다시 패치하도록 정보 구독
  useEffect(() => {
    if (!friendIds?.length) return;

    const today = formatDate(new Date());
    const statusChannel = supabase
      .channel("workoutHistory")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workoutHistory",
          filter: `userId=in.(${friendIds.join(",")})`,
        },
        (payload) => {
          // DELETE는 상세내용 감지가 안되어서 실시간 업데이트 X
          // 필요성도 INSERT에 비해 크지 않을 것으로 생각됨
          if (payload.new.date === today)
            queryClient.invalidateQueries({ queryKey: ["friendsStatus"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statusChannel);
    };
  }, [friendIds, queryClient.invalidateQueries]);

  // 친구 목록이나 친구 운동 기록이 바뀔때마다 데이터 가공
  useEffect(() => {
    if (!friendsData) return;
    if (!statusData?.length) {
      setFriends(friendsData);
      return;
    }

    const getStatus = (friendId: string) =>
      statusData?.find(({ userId }) => friendId === userId)?.status;

    setFriends(
      friendsData
        .map((friend) => {
          const status = getStatus(friend.id);
          return status ? { ...friend, status } : friend;
        })
        .sort((a, b) => {
          if (a.status && !b.status) return 1;
          if (!a.status && b.status) return -1;
          return 0;
        }),
    );
  }, [friendsData, statusData]);

  // 에러 스크린
  if (friendError || statusError) {
    const errorMessage =
      friendError?.message ||
      statusError?.message ||
      "친구 조회에 실패했습니다.";
    return (
      <SearchLayout
        data={[]}
        onChangeKeyword={handleKeywordChange}
        renderItem={() => <></>}
        emptyComponent={<ErrorScreen errorMessage={errorMessage} />}
      />
    );
  }

  // 로딩 스크린
  if (isFriendLoading || isStatusLoading || !friendsData) {
    return (
      <SearchLayout
        data={[]}
        onChangeKeyword={handleKeywordChange}
        renderItem={() => <></>}
        emptyComponent={<LoadingScreen />}
      />
    );
  }

  return (
    <SearchLayout
      data={friends}
      onChangeKeyword={handleKeywordChange}
      renderItem={({ item: friend }) => <FriendItem friend={friend} />}
      emptyComponent={
        <ErrorScreen
          errorMessage={
            keyword ? "친구를 찾지 못했어요" : "아직 친구가 없습니다."
          }
        />
      }
    />
  );
}
