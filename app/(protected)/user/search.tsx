import ErrorScreen from "@/components/ErrorScreen";
import { NonFriendItem } from "@/components/FriendItem";
import LoadingScreen from "@/components/LoadingScreen";
import { SearchLayout } from "@/components/SearchLayout";
import useFetchData from "@/hooks/useFetchData";
import { debounce } from "@/utils/DelayManager";
import { getNonFriends } from "@/utils/supabase";
import { useState } from "react";

export default function UserSearch() {
  const [keyword, setKeyword] = useState("");

  // 친구가 아닌 유저들 검색 키워드로 정보 조회
  const {
    data: userData,
    isLoading,
    error,
  } = useFetchData(
    ["search", "users", keyword],
    () => getNonFriends(keyword),
    "검색한 유저 조회에 실패했습니다.",
    !!keyword,
  );

  const handleKeywordChange = debounce((newKeyword: string) => {
    setKeyword(newKeyword);
  }, 500);

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
      data={userData?.data || []}
      onChangeKeyword={handleKeywordChange}
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
