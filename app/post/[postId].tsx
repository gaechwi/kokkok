import { HeaderWithBackAndPostPage } from "@/components/Header";
import PostItem from "@/components/PostItem";
import CommentsSection from "@/components/comments/CommentsSection";
import useFetchData from "@/hooks/useFetchData";
import { getCurrentUser, getPost } from "@/utils/supabase";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";

export default function PostDetail() {
  const { postId } = useLocalSearchParams();
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);

  const { data: user } = useFetchData(
    ["currentUser"],
    getCurrentUser,
    "현재 사용자를 불러올 수 없습니다.",
  );

  const { data: post } = useFetchData(
    ["post", postId],
    () => getPost(Number(postId)),
    "포스트를 불러오는데 실패했습니다.",
  );

  const onCloseComments = useCallback(() => {
    setIsCommentsVisible(false);
  }, []);

  return (
    <View className="flex-1 bg-white">
      <HeaderWithBackAndPostPage name={user?.username as string} />
      <PostItem
        author={{
          id: post?.userData?.id || "",
          name: post?.userData?.username || "",
          avatar: post?.userData?.avatarUrl || "",
        }}
        images={post?.images || []}
        contents={post?.contents || ""}
        liked={post?.isLikedByUser || false}
        likedAuthorAvatars={post?.likedAvatars || []}
        createdAt={post?.createdAt || ""}
        commentsCount={post?.totalComments || 0}
        comment={
          post?.commentData
            ? {
                author: {
                  name: post.commentData.author.username,
                  avatar: post.commentData.author.avatarUrl || "",
                },
                content: post.commentData.contents,
              }
            : null
        }
        postId={Number(postId)}
        onCommentsPress={() => setIsCommentsVisible(true)}
      />

      {isCommentsVisible && (
        <View className="flex-1">
          <CommentsSection
            visible={isCommentsVisible}
            onClose={onCloseComments}
            postId={Number(postId)}
          />
        </View>
      )}
    </View>
  );
}
