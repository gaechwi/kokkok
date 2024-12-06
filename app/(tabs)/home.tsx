import CommentsSection from "@/components/comments/CommentsSection";
import { getPosts } from "@/utils/supabase";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { View } from "react-native";
import PostItem from "../../components/PostItem";

export default function Home() {
  const [refreshing, setRefreshing] = useState(false);

  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const queryClient = useQueryClient();

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const onOpenComments = useCallback((postId: number) => {
    setSelectedPostId(postId);
    setIsCommentsVisible(true);
  }, []);

  const onCloseComments = useCallback(() => {
    setIsCommentsVisible(false);
    setSelectedPostId(null);
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
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
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <FlatList
        data={data?.pages.flatMap((page) => page.posts) ?? []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: post }) => (
          <PostItem
            key={post.id}
            author={{
              id: post.userData?.id ?? "",
              name: post.userData?.username ?? "",
              avatar: post.userData?.avatarUrl ?? "",
            }}
            images={post.images}
            liked={post.isLikedByUser}
            likedAuthorAvatar={post.likedAvatars ?? []}
            contents={post.contents}
            createdAt={post.createdAt}
            commentsCount={post.totalComments ?? 0}
            comment={{
              author: {
                name: post.commentData?.author?.username ?? "",
                avatar: post.commentData?.author?.avatarUrl ?? "",
              },
              content: post.commentData?.contents ?? "",
            }}
            postId={Number(post.id)}
            onCommentsPress={() => onOpenComments(Number(post.id))}
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
            onClose={onCloseComments}
            postId={selectedPostId}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
