import {
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  View,
} from "react-native";
import PostItem from "../../components/PostItem";
import { useState, useCallback } from "react";
import { getPosts } from "@/utils/supabase";
import CommentsSection from "@/components/comments/CommentsSection";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";

const AVATAR_URL =
  "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1730962073092-thumbnail.webp";

export default function Home() {
  const [refreshing, setRefreshing] = useState(false);

  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const queryClient = useQueryClient();

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const toggleComments = useCallback((postId: number) => {
    setSelectedPostId(postId);
    setIsCommentsVisible(true);
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts"],
      queryFn: ({ pageParam = 0 }) => getPosts({ page: pageParam, limit: 10 }),
      getNextPageParam: (lastPage) =>
        lastPage.hasNext ? lastPage.nextPage : undefined,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      placeholderData: keepPreviousData,
      initialPageParam: 0,
    });

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    setRefreshing(false);
  }, [queryClient]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <FlatList
        data={data?.pages.flatMap((page) => page.posts) ?? []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: post }) => (
          <PostItem
            key={post.id}
            author={{
              name: "John Doe",
              avatar: AVATAR_URL,
            }}
            images={post.images}
            liked={false}
            likedAuthorAvatar={[AVATAR_URL, AVATAR_URL, AVATAR_URL, AVATAR_URL]}
            contents={post.contents ?? ""}
            createdAt={post.createdAt}
            commentsCount={10}
            comment={{
              author: { name: "Jane Doe", avatar: AVATAR_URL },
              content: "Hello, World!",
            }}
            postId={Number(post.id)}
            onCommentsPress={toggleComments}
          />
        )}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="large" className="py-4" />
          ) : null
        }
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />

      {isCommentsVisible && selectedPostId !== null && (
        <View className="flex-1">
          <CommentsSection
            visible={isCommentsVisible}
            onClose={() => {
              setIsCommentsVisible(false);
              setSelectedPostId(null);
            }}
            postId={selectedPostId}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
