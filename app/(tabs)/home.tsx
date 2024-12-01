import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import PostItem from "../../components/PostItem";
import { getPosts } from "@/utils/appwrite";
import { useEffect, useState, useCallback } from "react";

const AVATAR_URL =
  "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1730962073092-thumbnail.webp";

export default function Home() {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Awaited<ReturnType<typeof getPosts>>>({
    posts: [],
    total: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const fetchPosts = useCallback(async () => {
    const fetchedPosts = await getPosts({});
    setPosts(fetchedPosts);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(0);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  const loadMorePosts = useCallback(async () => {
    if (loading || !posts.hasMore) return;

    setLoading(true);
    const nextPage = page + 1;
    const morePosts = await getPosts({ pageParam: nextPage });

    setPosts((prev) => ({
      posts: [...prev.posts, ...morePosts.posts],
      total: morePosts.total,
      hasMore: morePosts.hasMore,
    }));
    setPage(nextPage);
    setLoading(false);
  }, [loading, posts.hasMore, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <ScrollView
        className="w-full grow"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isEndReached =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20;

          if (isEndReached) {
            loadMorePosts();
          }
        }}
        scrollEventThrottle={16}
      >
        {posts.posts.map((post) => (
          <PostItem
            key={post.id}
            author={{
              name: "John Doe",
              avatar: AVATAR_URL,
            }}
            images={post.images}
            liked={false}
            contents={post.contents}
            createdAt={post.createdAt}
            commentsCount={10}
          />
        ))}
        {loading && <ActivityIndicator size="large" className="py-4" />}
      </ScrollView>
    </SafeAreaView>
  );
}
