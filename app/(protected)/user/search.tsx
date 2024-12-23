import ErrorScreen from "@/components/ErrorScreen";
import { NonFriendItem } from "@/components/FriendItem";
import LoadingScreen from "@/components/LoadingScreen";
import { SearchLayout } from "@/components/SearchLayout";
import useInfiniteLoad from "@/hooks/useInfiniteLoad";
import { debounce } from "@/utils/DelayManager";
import { getNonFriends } from "@/utils/supabase";
import { useState } from "react";

const LIMIT = 12;

export default function UserSearch() {
  const [keyword, setKeyword] = useState("");

  // 유저의 친구 요청 정보 조회
  const {
    data: userData,
    isFetching,
    isFetchingNextPage,
    error,
    loadMore,
  } = useInfiniteLoad({
    queryFn: getNonFriends(keyword),
    queryKey: ["search", "users", keyword],
    limit: LIMIT,
  });
  const hasData = !!userData?.pages[0].total;

  const handleKeywordChange = debounce((newKeyword: string) => {
    setKeyword(newKeyword);
  }, 200);

  // 에러 스크린
  if (error) {
    return (
      <SearchLayout
        data={[]}
        onChangeKeyword={handleKeywordChange}
        renderItem={() => <></>}
        emptyComponent={
          <ErrorScreen iconSize={106} errorMessage={error.message} />
        }
      />
    );
  }

  // 로딩 스크린
  if (isFetching) {
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
      data={hasData ? userData.pages.flatMap((page) => page.data) : []}
      onChangeKeyword={handleKeywordChange}
      loadMore={loadMore}
      isFetchingNextPage={isFetchingNextPage}
      renderItem={({ item: user }) => <NonFriendItem user={user} />}
      emptyComponent={
        keyword ? (
          <ErrorScreen
            iconType="NOT_DONE"
            iconSize={106}
            errorMessage="친구를 찾을 수 없습니다"
          />
        ) : (
          <ErrorScreen
            iconType="DONE"
            iconSize={106}
            errorMessage="닉네임으로 친구를 검색해주세요"
          />
        )
      }
    />
  );
}
