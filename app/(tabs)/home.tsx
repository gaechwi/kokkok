import { RefreshControl, SafeAreaView, ScrollView } from "react-native";
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const fetchedPosts = await getPosts();
    setPosts(fetchedPosts);
    setRefreshing(false);
  }, []);

  const fetchPosts = useCallback(async () => {
    const fetchedPosts = await getPosts();
    setPosts(fetchedPosts);
  }, []);

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
            createdAt={post.createdAt}
            commentsCount={10}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
