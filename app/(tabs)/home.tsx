import MotionModal from "@/components/MotionModal";
import CommentsSection from "@/components/comments/CommentsSection";
import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import { default as imgs } from "@/constants/images";
import useFetchData from "@/hooks/useFetchData";
import { getCurrentUser, getPostLikes, getPosts } from "@/utils/supabase";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from "react-native";
import { View } from "react-native";
import PostItem from "../../components/PostItem";

const { height: deviceHeight } = Dimensions.get("window");

export default function Home() {
  const [refreshing, setRefreshing] = useState(false);

  const [isCommentsVisible, setIsCommentsVisible] = useState(false);

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const [isLikedModalVisible, setIsLikedModalVisible] = useState(false);

  const router = useRouter();

  const user = useFetchData(
    ["currentUser"],
    getCurrentUser,
    "사용자 정보를 불러오는데 실패했습니다.",
  );

  const { data: likedAuthorData } = useFetchData(
    ["likedAuthorAvatar", selectedPostId],
    () => {
      if (selectedPostId) return getPostLikes(selectedPostId);
      return Promise.resolve([]);
    },
    "좋아요한 사용자 정보를 불러오는데 실패했습니다.",
    isLikedModalVisible,
  );

  const onOpenLikedAuthor = useCallback((postId: number) => {
    setSelectedPostId(postId);
    setIsLikedModalVisible(true);
  }, []);

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
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
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
            onAuthorPress={onOpenLikedAuthor}
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

      <View className="flex-1 ">
        <MotionModal
          visible={isLikedModalVisible}
          onClose={() => setIsLikedModalVisible(false)}
          maxHeight={deviceHeight}
          initialHeight={deviceHeight * 0.6}
        >
          <View className="flex-1 ">
            <FlatList
              className="w-full px-4 py-2 "
              data={likedAuthorData}
              keyExtractor={(item, index) => `liked-author-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setIsLikedModalVisible(false);
                    if (user.data?.id === item.author?.id)
                      router.push("/mypage");
                    else router.push(`/user/${item.author?.id}`);
                  }}
                  className="w-full flex-row items-center gap-2 px-2 py-4"
                >
                  <View className="flex-1 flex-row items-center gap-2">
                    <Image
                      source={
                        item.author?.avatarUrl
                          ? { uri: item.author?.avatarUrl }
                          : imgs.AvaTarDefault
                      }
                      resizeMode="cover"
                      className="size-10 rounded-full"
                    />
                    <Text className="font-psemibold text-[16px] text-gray-90 leading-[150%]">
                      {item.author?.username}
                    </Text>
                  </View>

                  <Icons.HeartIcon
                    width={24}
                    height={24}
                    color={colors.secondary.red}
                    fill={colors.secondary.red}
                  />
                </TouchableOpacity>
              )}
            />
          </View>
        </MotionModal>
      </View>
    </SafeAreaView>
  );
}
