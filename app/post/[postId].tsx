import { HeaderWithUsername } from "@/components/Header";
import { TwoButtonModal } from "@/components/Modal";
import MotionModal from "@/components/MotionModal";
import PostItem from "@/components/PostItem";
import CommentsSection from "@/components/comments/CommentsSection";
import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import images from "@/constants/images";
import useFetchData from "@/hooks/useFetchData";
import { getCurrentUser, getPost, getPostLikes } from "@/utils/supabase";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity } from "react-native";
import { Dimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: deviceHeight } = Dimensions.get("window");

export default function PostDetail() {
  const { postId } = useLocalSearchParams();
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isLikedModalVisible, setIsLikedModalVisible] = useState(false);
  const [isNotFoundModalVisible, setIsNotFoundModalVisible] = useState(false);

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const router = useRouter();

  const { data: user } = useFetchData(
    ["currentUser"],
    getCurrentUser,
    "현재 사용자를 불러올 수 없습니다.",
  );

  const {
    data: post,
    isPending: isPostPending,
    error: postError,
  } = useFetchData(
    ["post", postId],
    () => getPost(Number(postId)),
    "포스트를 불러오는데 실패했습니다.",
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

  useFocusEffect(() => {
    if (postError || (!isPostPending && !post)) setIsNotFoundModalVisible(true);
  });

  const onOpenLikedAuthor = useCallback((postId: number) => {
    setSelectedPostId(postId);
    setIsLikedModalVisible(true);
  }, []);

  const onCloseComments = useCallback(() => {
    setIsCommentsVisible(false);
  }, []);

  return (
    <>
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <HeaderWithUsername
          name={post?.userData.username ?? ""}
          type="POST_PAGE"
        />
        {post && (
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
            onAuthorPress={onOpenLikedAuthor}
          />
        )}
      </SafeAreaView>

      {isCommentsVisible && (
        <View className="flex-1">
          <CommentsSection
            visible={isCommentsVisible}
            onClose={onCloseComments}
            postId={Number(postId)}
            authorId={post?.userData.id || ""}
          />
        </View>
      )}

      {isLikedModalVisible && (
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
                      if (user?.id === item.author?.id) router.push("/mypage");
                      else router.push(`/user/${item.author?.id}`);
                    }}
                    className="w-full flex-1 flex-row items-center gap-2 px-2 py-4"
                  >
                    <Image
                      source={
                        item.author?.avatarUrl
                          ? { uri: item.author?.avatarUrl }
                          : images.AvaTarDefault
                      }
                      resizeMode="cover"
                      className="size-10 rounded-full"
                    />
                    <Text
                      className="flex-1 font-psemibold text-[16px] text-gray-90 leading-[150%]"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.author?.username}
                    </Text>

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
      )}

      {isNotFoundModalVisible && (
        <TwoButtonModal
          isVisible={isNotFoundModalVisible}
          onClose={() => {
            setIsNotFoundModalVisible(false);
            router.back();
          }}
          emoji="sad"
          contents={"게시글이 삭제되었어요."}
          leftButtonText="뒤로가기"
          rightButtonText="홈으로"
          onLeftButtonPress={() => {
            setIsNotFoundModalVisible(false);
            router.back();
          }}
          onRightButtonPress={() => {
            setIsNotFoundModalVisible(false);
            router.replace("/home");
          }}
        />
      )}
    </>
  );
}
