import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ErrorScreen from "@/components/ErrorScreen";
import { FriendItem } from "@/components/FriendItem";
import LoadingScreen from "@/components/LoadingScreen";
import SearchBar from "@/components/SearchBar";
import useFetchData from "@/hooks/useFetchData";
import type { StatusInfo } from "@/types/Friend.interface";
import type { UserProfile } from "@/types/User.interface";
import { debounce } from "@/utils/DelayManager";
import { formatDate } from "@/utils/formatDate";
import {
  getCurrentSession,
  getFriends,
  getFriendsStatus,
  supabase,
} from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";

interface FriendLayoutProps {
  friends: UserProfile[];
  onChangeKeyword: (newKeyword: string) => void;
  emptyComponent: React.ReactElement;
}

function FriendLayout({
  friends,
  onChangeKeyword,
  emptyComponent,
}: FriendLayoutProps) {
  const [keyword, setKeyword] = useState("");

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <FlatList
        data={friends}
        keyExtractor={(friend) => friend.id}
        renderItem={({ item: friend }) => <FriendItem friend={friend} />}
        className="px-6 grow w-full"
        contentContainerStyle={friends.length ? {} : { flex: 1 }}
        ListHeaderComponent={
          <SearchBar
            value={keyword}
            customClassName="mt-6 mb-2"
            handleChangeText={(newKeyword: string) => {
              setKeyword(newKeyword);
              onChangeKeyword(newKeyword);
            }}
          />
        }
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={<View className="h-4" />}
      />
    </SafeAreaView>
  );
}

export default function Friend() {
  const queryClient = useQueryClient();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [keyword, setKeyword] = useState("");

  // 로그인한 유저 정보 조회
  const { data: session, error: userError } = useFetchData<Session>(
    ["session"],
    getCurrentSession,
    "로그인 정보 조회에 실패했습니다.",
  );

  // 유저의 친구 정보 조회
  const {
    data: friendsData,
    isLoading: isFriendLoading,
    error: friendError,
  } = useFetchData<UserProfile[]>(
    ["friends", keyword],
    () => getFriends(session?.user.id || "", keyword),
    "친구 조회에 실패했습니다.",
    !!session?.user.id,
  );

  const friendIds = friendsData?.map((friend) => friend.id);

  // 친구의 운동 상태 정보 조회
  const {
    data: statusData,
    isLoading: isStatusLoading,
    error: statusError,
  } = useFetchData<StatusInfo[]>(
    ["friendsStatus"],
    () => getFriendsStatus(friendIds || []),
    "친구 조회에 실패했습니다.",
    !!friendIds?.length,
  );

  const handleKeywordChange = debounce((newKeyword: string) => {
    setKeyword(newKeyword);
  }, 500);

  // 친구의 운동 정보가 바뀌면 쿼리 다시 패치하도록 정보 구독
  useEffect(() => {
    if (!friendIds?.length) return;

    const today = formatDate(new Date());
    const statusChannel = supabase
      .channel("workoutHistory")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workoutHistory" },
        (payload) => {
          if (
            (payload.eventType === "DELETE" &&
              payload.old.date === today &&
              friendIds.includes(payload.old.userId)) ||
            (payload.eventType === "INSERT" &&
              payload.new.date === today &&
              friendIds.includes(payload.new.userId))
          )
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
  if (userError || friendError || statusError) {
    const errorMessage =
      userError?.message ||
      friendError?.message ||
      statusError?.message ||
      "친구 조회에 실패했습니다.";
    return (
      <FriendLayout
        friends={[]}
        onChangeKeyword={handleKeywordChange}
        emptyComponent={<ErrorScreen errorMessage={errorMessage} />}
      />
    );
  }

  // 로딩 스크린
  if (isFriendLoading || isStatusLoading || !friendsData) {
    return (
      <FriendLayout
        friends={[]}
        onChangeKeyword={handleKeywordChange}
        emptyComponent={<LoadingScreen />}
      />
    );
  }

  return (
    <FriendLayout
      friends={friends}
      onChangeKeyword={handleKeywordChange}
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
