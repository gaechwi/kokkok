import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import ErrorScreen from "@/components/ErrorScreen";
import { FriendItem } from "@/components/FriendItem";
import LoadingScreen from "@/components/LoadingScreen";
import { SearchLayout } from "@/components/SearchLayout";
import useInfiniteLoad from "@/hooks/useInfiniteLoad";
import { debounce } from "@/utils/DelayManager";
import { formatDate } from "@/utils/formatDate";
import { getFriends, supabase } from "@/utils/supabase";
import { useFocusEffect } from "expo-router";

const LIMIT = 12;

export default function Friend() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");

  // 유저의 친구 정보 조회
  const {
    data: friendData,
    isLoading,
    isFetchingNextPage,
    error,
    loadMore,
  } = useInfiniteLoad({
    queryFn: getFriends(keyword),
    queryKey: ["friends", keyword],
    limit: LIMIT,
  });
  const friends = friendData?.pages.flatMap((page) => page.data) || [];

  const handleKeywordChange = debounce((newKeyword: string) => {
    setKeyword(newKeyword);
  }, 200);

  // 친구창에 focus 들어올 때마다 친구목록 새로고침 (검색중일 때 제외)
  useFocusEffect(() => {
    if (!keyword && !isFetchingNextPage) {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    }
  });

  // 친구의 운동 정보가 바뀌면 쿼리 다시 패치하도록 정보 구독
  useEffect(() => {
    const today = formatDate(new Date());
    const friendIds = friends?.map(({ id }) => id);

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
            queryClient.invalidateQueries({ queryKey: ["friends"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statusChannel);
    };
  }, [friends, queryClient.invalidateQueries]);

  // 에러 스크린
  if (error) {
    return (
      <SearchLayout
        data={[]}
        onChangeKeyword={handleKeywordChange}
        renderItem={() => <></>}
        emptyComponent={<ErrorScreen errorMessage={error.message} />}
      />
    );
  }

  // 로딩 스크린
  if (isLoading) {
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
      loadMore={loadMore}
      isFetchingNextPage={isFetchingNextPage}
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
