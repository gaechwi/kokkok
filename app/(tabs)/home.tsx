import {
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  FlatList,
} from "react-native";
import PostItem from "../../components/PostItem";
import { useEffect, useState, useCallback } from "react";
import { getPosts } from "@/utils/supabase";

const AVATAR_URL =
  "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1730962073092-thumbnail.webp";

const OFFSET = 0;
const LIMIT = 10;

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
    const fetchedPosts = await getPosts({
      offset: OFFSET,
      limit: LIMIT,
    });
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
    const morePosts = await getPosts({
      offset: nextPage * LIMIT,
      limit: LIMIT,
    });

    setPosts((prev) => {
      const existingIds = new Set(prev.posts.map((post) => post.id));

      const newPosts = morePosts.posts.filter(
        (post) => !existingIds.has(post.id),
      );

      return {
        posts: [...prev.posts, ...newPosts],
        total: morePosts.total,
        hasMore: morePosts.hasMore && newPosts.length > 0,
      };
    });
    setPage(nextPage);
    setLoading(false);
  }, [loading, posts.hasMore, page]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const isEndReached =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

      if (isEndReached) {
        loadMorePosts();
      }
    },
    [loadMorePosts],
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <FlatList
        data={posts.posts}
        keyExtractor={(
          post: Awaited<ReturnType<typeof getPosts>>["posts"][0],
        ) => post.id.toString()}
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
            contents={post.contents}
            createdAt={post.createdAt}
            commentsCount={10}
            comment={{
              author: { name: "Jane Doe", avatar: AVATAR_URL },
              content: "Hello, World!",
            }}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" className="py-4" /> : null
        }
        onScroll={handleScroll}
      />
    </SafeAreaView>
  );
}
