import type { RequestResponse, StatusInfo } from "@/types/Friend.interface";
import type { Notification } from "@/types/Notification.interface";
import type { UserProfile } from "@/types/User.interface";
import type { Database } from "@/types/supabase";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Session, createClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import type * as ImagePicker from "expo-image-picker";
import { formatDate } from "./formatDate";

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================
//
//                    auth
//
// ============================================

// 회원가입
export async function signUp({
  id,
  email,
  password,
  username,
  description,
}: {
  id: string;
  email: string;
  password: string;
  username: string;
  description?: string;
}) {
  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) throw updateError;

    const { data: profileData, error: profileError } = await supabase
      .from("user")
      .insert([
        {
          id,
          email,
          username,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`,
          description: description || null,
          isOAuth: false,
        },
      ])
      .select()
      .single();

    if (profileError) throw profileError.message;
    return profileData;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "회원가입에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// 로그인
export async function signIn({
  email,
  password,
}: { email: string; password: string }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.session) throw new Error("로그인에 실패했습니다");

    return data.session;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "로그인에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// OTP 인증 전송
export async function sendUpOTP(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) throw error;
  return data;
}

// OTP 인증 확인
export async function verifySignUpOTP(email: string, token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) throw error;
    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "OTP 인증에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// Step 1: 비밀번호 재설정 이메일 전송
export async function resetPassword(email: string) {
  try {
    // isOAuth 확인
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("isOAuth")
      .eq("email", email)
      .single();

    if (userError) throw userError;

    // OAuth 사용자인 경우 비밀번호 재설정 불가
    if (userData?.isOAuth) {
      throw new Error(
        "소셜 로그인으로 가입된 계정입니다. 소셜 로그인을 이용해주세요.",
      );
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "비밀번호 재설정에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// Step 2: OTP 검증만 수행
export async function verifyResetToken(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "recovery",
  });

  if (error) throw error;
  return data;
}

// Step 3: 비밀번호 변경
export async function updateNewPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
}

// ============================================
//
//                    user
//
// ============================================

// 유저 정보 조회
export async function getUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user")
      .select()
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("유저를 불러올 수 없습니다.");

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "유저 정보 조회에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// 로그인한 유저 세션 정보 조회
export async function getCurrentSession(): Promise<Session> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("세션 정보를 찾을 수 없습니다");

  return session;
}

// 로그인한 유저 정보 조회
export async function getCurrentUser() {
  const { user } = await getCurrentSession();
  return await getUser(user.id);
}

// 프로필 업데이트
export async function updateMyProfile(
  userId: string,
  profile: {
    username: string;
    description: string;
    avatarUrl?: ImagePicker.ImagePickerAsset;
  },
) {
  try {
    const avatarUrl = profile.avatarUrl
      ? await uploadImage(profile.avatarUrl)
      : null;

    await supabase
      .from("user")
      .update({
        ...profile,
        avatarUrl: avatarUrl || null,
      })
      .eq("id", userId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "프로필 업데이트에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// 유저 데이터베이스 삭제
export async function deleteUser(userId: string) {
  try {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    await supabase.from("user").delete().eq("id", userId);
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "유저 삭제에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// ============================================
//
//                    image
//
// ============================================

// 이미지 업로드
export async function uploadImage(file: ImagePicker.ImagePickerAsset) {
  if (!file) throw new Error("파일이 제공되지 않았습니다.");

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];

  if (file.fileSize && file.fileSize > MAX_FILE_SIZE) {
    throw new Error("파일 크기는 5MB를 초과할 수 없습니다.");
  }

  if (file.mimeType && !ALLOWED_TYPES.includes(file.mimeType)) {
    throw new Error("지원되지 않는 파일 형식입니다.");
  }

  try {
    const filePath = `${new Date().getTime()}_${file.fileName || "untitled"}`;

    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: "base64",
    });
    const contentType = file.mimeType || "image/jpeg";
    await supabase.storage.from("images").upload(filePath, decode(base64), {
      contentType,
    });

    const result = await supabase.storage.from("images").getPublicUrl(filePath);
    return result.data.publicUrl;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? `uploadImage: ${error.message}`
        : "파일 업로드에 실패했습니다.";
    throw new Error(errorMessage);
  }
}

// ============================================
//
//                    post
//
// ============================================

// 게시글 조회
export const getPosts = async ({ page = 0, limit = 10 }) => {
  try {
    const { data, error, count } = await supabase.rpc(
      "get_posts_with_details",
      {
        startindex: page * limit,
        endindex: (page + 1) * limit - 1,
      },
    );

    if (error) throw new Error("게시글을 가져오는데 실패했습니다.");

    return {
      posts: data,
      total: count ?? data.length,
      hasNext: count ? (page + 1) * limit < count : false,
      nextPage: page + 1,
    };
  } catch (error) {
    console.error("Error in getPosts:", error);
    throw new Error("게시글을 가져오는데 실패했습니다.");
  }
};

// 게시글 상세 조회
export async function getPost(postId: number) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: post, error: postError } = await supabase
      .from("post")
      .select(
        `
        id,
        images,
        contents,
        likes,
        createdAt,
        user (id, username, avatarUrl)
      `,
      )
      .eq("id", postId)
      .single();

    if (postError) throw postError;
    if (!post) throw new Error("게시글을 찾을 수 없습니다.");

    const {
      data: comment,
      error: commentError,
      count,
    } = await supabase
      .from("comment")
      .select("id, contents, likes, author:user (id, username, avatarUrl)", {
        count: "exact",
      })
      .eq("postId", postId)
      .order("likes", { ascending: false })
      .order("createdAt", { ascending: false })
      .single();

    if (commentError && commentError.code !== "PGRST116") {
      // 댓글이 없는 경우 오류 처리
      throw commentError;
    }

    let isLiked = false;

    if (user) {
      // postLike 테이블에서 좋아요 여부 확인
      const { data: likeData, error: likeError } = await supabase
        .from("postLike")
        .select("id")
        .eq("postId", postId)
        .eq("userId", user.id)
        .single();

      if (likeError && likeError.code !== "PGRST116") {
        throw likeError;
      }
      isLiked = !!likeData; // 좋아요 데이터가 존재하면 true
    }

    return {
      ...post,
      comment: { ...comment, totalComments: count },
      isLiked,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "게시글 조회에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// 게시글 좋아요 토글
export async function toggleLikePost(postId: number) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("유저 정보를 찾을 수 없습니다.");

    // postLike 테이블에서 좋아요 여부 확인
    const { data: likeData, error: likeError } = await supabase
      .from("postLike")
      .select("id")
      .eq("postId", postId)
      .eq("userId", user.id)
      .single();

    if (likeError && likeError.code !== "PGRST116") {
      throw likeError;
    }

    if (likeData) {
      // 좋아요 취소
      await supabase.from("postLike").delete().eq("id", likeData.id);
    } else {
      // 좋아요
      await supabase.from("postLike").insert({ postId, userId: user.id });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "좋아요 토글에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// 게시물 생성
export async function createPost({
  contents,
  images,
}: { contents?: string; images: ImagePicker.ImagePickerAsset[] }) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("유저 정보를 찾을 수 없습니다.");

    // 내용이 빈 문자열이면 undefined로 설정
    const postContents = contents === "" ? undefined : contents;

    // 이미지 업로드 및 URL 수집
    const imageUrls = await Promise.all(
      images.map((image) => uploadImage(image)),
    );

    // undefined가 아닌 URL만 필터링
    const validImageUrls = imageUrls.filter(
      (url): url is string => url !== undefined,
    );

    // 게시물 생성
    const { data: newPost, error: postError } = await supabase
      .from("post")
      .insert([
        {
          userId: user.id,
          images: validImageUrls,
          contents: postContents || "",
        },
      ])
      .select("*, user: userId (id, username, avatarUrl)")
      .single();

    if (postError) throw postError;
    if (!newPost) throw new Error("게시물을 생성중 문제가 발생했습니다.");

    return newPost;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? `createPost: ${error.message}`
        : "게시물 생성에 실패했습니다.";
    throw new Error(errorMessage);
  }
}

// 게시글 수정
export async function updatePost({
  postId,
  images,
  prevImages,
  contents,
}: {
  postId: number;
  images: ImagePicker.ImagePickerAsset[];
  prevImages: string[];
  contents: string;
}) {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("유저 정보를 찾을 수 없습니다.");

    // 기존 게시글 조회
    const { data: existingPost, error: postError } = await supabase
      .from("post")
      .select("userId, contents, images")
      .eq("id", postId)
      .single();

    if (postError) throw postError;
    if (!existingPost) throw new Error("게시글을 찾을 수 없습니다.");

    // 작성자 권한 체크
    if (user.id !== existingPost.userId) {
      throw new Error("게시글 작성자만 수정할 수 있습니다.");
    }

    // 변경사항 체크
    const contentsChanged = contents !== existingPost.contents;
    const hasNewImages = images.length > 0;

    // 변경사항이 없으면 기존 게시글 반환
    if (
      !contentsChanged &&
      !hasNewImages &&
      prevImages.length === existingPost.images.length
    ) {
      return existingPost;
    }

    // 새로운 이미지만 업로드
    let newImageUrls: string[] = [];
    if (hasNewImages) {
      const uploadedUrls = await Promise.all(
        images.map((image) => uploadImage(image)),
      );
      newImageUrls = uploadedUrls.filter(
        (url): url is string => url !== undefined,
      );
    }

    // 이전 이미지와 새로운 이미지 합치기
    const validImageUrls = [...prevImages, ...newImageUrls];

    // 게시글 수정
    const { data: updatedPost, error: updateError } = await supabase
      .from("post")
      .update({ contents, images: validImageUrls })
      .eq("id", postId)
      .select("*, user: userId (id, username, avatarUrl)")
      .single();

    if (updateError) throw updateError;
    if (!updatedPost) throw new Error("게시글 수정에 실패했습니다.");

    return updatedPost;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "게시글 수정에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// 게시글 삭제
export async function deletePost(postId: number) {
  try {
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) throw new Error("유저 정보를 찾을 수 없습니다.");

    // 게시글 작성자인지 확인
    const { data: post, error: postError } = await supabase
      .from("post")
      .select("userId")
      .eq("id", postId)
      .single();

    if (postError) throw postError;
    if (!post) throw new Error("게시글을 찾을 수 없습니다.");

    if (user.id !== post.userId) {
      throw new Error("게시글 작성자만 삭제할 수 있습니다.");
    }

    await supabase.from("post").delete().eq("id", postId);

    return { message: "게시글이 삭제되었습니다." };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "게시글 삭제에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// ============================================
//
//                    Comment
//
// ============================================

// 댓글 조회
export async function getComments(postId: number, page = 0, limit = 10) {
  try {
    const start = page * limit;
    const end = start + limit - 1;

    const { count } = await supabase
      .from("comment")
      .select("*", { count: "exact", head: true })
      .eq("postId", postId)
      .is("parentsCommentId", null);

    const { data, error } = await supabase.rpc("get_comments", {
      postid: postId,
      startindex: start,
      endindex: end,
    });

    if (error) throw error;
    if (!data) throw new Error("댓글을 가져올 수 없습니다.");

    return {
      comments: data,
      total: count ?? data.length,
      hasNext: count ? (page + 1) * limit < count : false,
      nextPage: page + 1,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "댓글 조회에 실패했습니다",
    );
  }
}

// 답글 조회
export async function getReplies(parentId: number, page = 0, limit = 10) {
  try {
    const start = page === 0 ? 0 : (page - 1) * limit + 1;
    const end = page === 0 ? 1 : start + limit;

    const { count } = await supabase
      .from("comment")
      .select("*", { count: "exact", head: true })
      .eq("parentsCommentId", parentId);

    if (!count) {
      return {
        replies: [],
        total: 0,
        hasNext: false,
        nextPage: 0,
      };
    }

    const { data, error } = await supabase.rpc("get_replies_with_likes", {
      parentid: parentId,
      startindex: start,
      endindex: end,
    });

    if (error) throw error;
    if (!data) throw new Error("답글을 가져올 수 없습니다.");

    const hasNext = page === 0 ? count > 1 : data.length === limit;

    return {
      replies: data,
      total: count ?? data.length,
      hasNext,
      nextPage: page + 1,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "답글 조회에 실패했습니다",
    );
  }
}

// 댓글 좋아요 토글
export async function toggleLikeComment(commentId: number) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("유저 정보를 찾을 수 없습니다.");

    // commentLike 테이블에서 좋아요 여부 확인
    const { data: likeData, error: likeError } = await supabase
      .from("commentLike")
      .select("id")
      .eq("commentId", commentId)
      .eq("userId", user.id)
      .single();

    if (likeError && likeError.code !== "PGRST116") {
      throw likeError;
    }

    if (likeData) {
      // 좋아요 취소 및 likes 감소
      const { error: deleteError } = await supabase.rpc(
        "decrement_comment_likes",
        {
          p_comment_id: commentId,
        },
      );
      if (deleteError) throw deleteError;

      const { error: unlikeError } = await supabase
        .from("commentLike")
        .delete()
        .eq("id", likeData.id);
      if (unlikeError) throw unlikeError;
    } else {
      // 좋아요 추가 및 likes 증가
      const { error: insertError } = await supabase.rpc(
        "increment_comment_likes",
        {
          p_comment_id: commentId,
        },
      );
      if (insertError) throw insertError;

      const { error: likeInsertError } = await supabase
        .from("commentLike")
        .insert({ commentId, userId: user.id });
      if (likeInsertError) throw likeInsertError;
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "댓글 좋아요 토글에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// 댓글 작성
export async function createComment({
  postId,
  contents,
  parentId,
  replyCommentId,
}: {
  postId: number;
  contents: string;
  parentId?: number;
  replyCommentId?: number;
}) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("유저 정보를 찾을 수 없습니다.");

    const { data: newComment, error: commentError } = await supabase
      .from("comment")
      .insert({
        postId,
        userId: user.id,
        contents,
        parentsCommentId: parentId || null,
        replyCommentId: replyCommentId || null,
      })
      .select(
        `
          id, 
          contents, 
          userId, 
          createdAt, 
          user (id, username, avatarUrl)
        `,
      )
      .single();

    if (commentError) throw commentError;
    if (!newComment) throw new Error("댓글을 생성하는데 실패했습니다.");

    return newComment;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "댓글 생성에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// 댓글 삭제
export async function deleteComment(commentId: number) {
  try {
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) throw new Error("유저 정보를 찾을 수 없습니다.");

    // 댓글 작성자인지 확인
    const { data: comment, error: commentError } = await supabase
      .from("comment")
      .select("userId")
      .eq("id", commentId)
      .single();

    if (commentError) throw commentError;
    if (!comment) throw new Error("댓글을 찾을 수 없습니다.");

    if (user.id !== comment.userId) {
      throw new Error("댓글 작성자만 삭제할 수 있습니다.");
    }

    await supabase.from("comment").delete().eq("id", commentId);

    return { message: "댓글이 삭제되었습니다." };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "댓글 삭제에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// 내 게시물 조회
export async function getMyPosts(userId: string) {
  try {
    const { data: posts, error: postsError } = await supabase
      .from("post")
      .select(`
        id,
        images
      `)
      .eq("userId", userId)
      .order("createdAt", { ascending: false });

    if (postsError) throw postsError;

    return posts;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "프로필 조회에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// ============================================
//
//                    friend
//
// ============================================

// 친구 조회
export async function getFriends(userId: string): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from("friendRequest")
    .select("to: to (id, username, avatarUrl, description)")
    .eq("from", userId)
    .eq("isAccepted", true);

  if (error) throw error;
  if (!data) throw new Error("친구를 불러올 수 없습니다.");

  return data.map(({ to }) => to);
}

// 모든 친구의 운동 상태 조회
export async function getFriendsStatus(
  friendIds: string[],
): Promise<StatusInfo[]> {
  if (!friendIds.length) return [];

  const { data, error } = await supabase
    .from("workoutHistory")
    .select("userId, status")
    .in("userId", friendIds)
    .eq("date", formatDate(new Date()));

  if (error) throw error;
  if (!data) return [];

  return data;
}

// 친구요청 조회 조회
export async function getFriendRequests(
  userId: string,
  offset = 0,
  limit = 12,
): Promise<RequestResponse> {
  const { data, error, count } = await supabase
    .from("friendRequest")
    .select(
      `
          id,
          from: from (id, username, avatarUrl, description),
          to
        `,
      { count: "exact" },
    )
    .eq("to", userId)
    .is("isAccepted", null)
    .order("createdAt", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  if (!data) throw new Error("친구 요청을 불러올 수 없습니다.");

  return {
    data: data.map((request) => ({
      requestId: request.id,
      toUserId: request.to,
      fromUser: request.from,
    })),
    total: count || 0,
    hasMore: count ? offset + limit < count : false,
  };
}

// 친구요청 생성
export async function createFriendRequest(
  from: string,
  to: string,
  isAccepted: boolean | null,
) {
  const { error } = await supabase
    .from("friendRequest")
    .insert({ from, to, isAccepted });

  if (error) throw error;
}

// 친구요청 반응 업데이트
export async function putFriendRequest(requestId: string, isAccepted: boolean) {
  const { error } = await supabase
    .from("friendRequest")
    .update({ isAccepted })
    .eq("id", requestId);

  if (error) throw error;
}

// 친구 요청 삭제
export async function deleteFriendRequest(requestId: string) {
  const { error } = await supabase
    .from("friendRequest")
    .delete()
    .eq("id", requestId);

  if (error) throw error;
}

// ============================================
//
//                    history
//
// ============================================

// 운동 기록 조희
export async function getHistories(
  year: number,
  month: number,
): Promise<History[]> {
  const { user } = await getCurrentSession();

  const startDateString = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0); // month+1의 0번째 날짜는 해당 월의 마지막 날
  const endDateString = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(
    endDate.getDate(),
  ).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("workoutHistory")
    .select("date, status")
    .eq("userId", user.id)
    .gte("date", startDateString)
    .lte("date", endDateString)
    .order("date", { ascending: true });

  if (error) throw error;

  return data as History[];
}

// 쉬는 날 조회
export async function getRestDays(): Promise<Pick<History, "date">[]> {
  const { user } = await getCurrentSession();

  const currentDate = new Date();
  const startOfMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("workoutHistory")
    .select("date")
    .eq("userId", user.id)
    .eq("status", "rest")
    .gte("date", startOfMonth)
    .order("date", { ascending: true });

  if (error) throw error;

  return data as Pick<History, "date">[];
}

// 쉬는 날 추가
export async function addRestDay(
  dates: Pick<History, "date">[],
): Promise<void> {
  const { user } = await getCurrentSession();

  const records = dates.map(({ date }) => ({
    userId: user.id,
    date,
    status: "rest" as const,
  }));

  const { data, error } = await supabase
    .from("workoutHistory")
    .upsert(records, {
      onConflict: "userId,date",
      ignoreDuplicates: false,
    });

  if (error) {
    throw error;
  }
}

// 쉬는 날 제거
export async function deleteRestDay(
  dates: Pick<History, "date">[],
): Promise<void> {
  const { user } = await getCurrentSession();

  const days = dates.map((item) => item.date);

  const { data, error } = await supabase
    .from("workoutHistory")
    .delete()
    .eq("userId", user.id)
    .eq("status", "rest")
    .in("date", days);

  if (error) {
    throw error;
  }
}

// ============================================
//
//                 notification
//
// ============================================

// 가장 최근 특정 친구를 찌른 기록 조회
export async function getLatestStabForFriend(
  myId: string,
  friendId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("notification")
    .select("createdAt")
    .eq("from", myId)
    .eq("to", friendId)
    .eq("type", "poke")
    .order("createdAt", { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  if (!data) throw new Error("콕 찌르기 정보를 가져올 수 없습니다.");

  return data.createdAt;
}

// 알림 생성
export async function createNotification(notification: Notification) {
  const { error } = await supabase.from("notification").insert(notification);
  if (error) throw error;
}

// ============================================
//
//                    type
//
// ============================================

// 게시글 타입 정의
interface Post {
  id: string;
  images: string[];
  contents: string;
  createdAt: string;
  likes: number;
  // author: User;
}

// 운동 기록 타입 정의
type HistoryDate = `${number}-${number}-${number}`;
interface History {
  date: HistoryDate;
  status: "done" | "rest";
}
