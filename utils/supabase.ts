import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";
import type { Database } from "@/types/supabase";

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
  email,
  password,
  username,
  description,
}: {
  email: string;
  password: string;
  username: string;
  description?: string;
}) {
  try {
    // 1. 계정 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError)
      throw new Error(`계정 생성에 실패했습니다: ${authError.message}`);
    if (!authData.user)
      throw new Error(
        "계정 생성에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.",
      );

    // 2. 프로필 정보 저장
    const { data: profileData, error: profileError } = await supabase
      .from("user")
      .insert([
        {
          id: authData.user.id,
          email,
          username,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`,
          description: description || null,
        },
      ])
      .select()
      .single();

    if (profileError) throw profileError;
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

    if (error) throw error;
    if (!data.session) throw new Error("로그인에 실패했습니다");

    return data.session;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "로그인에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// ============================================
//
//                    user
//
// ============================================

// 유저 정보 조회
export async function getUser() {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("유저 ID를 찾을 수 없습니다.");

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

    if (error) {
      console.error("Error fetching posts:", error);
      throw new Error("게시글을 가져오는데 실패했습니다.");
    }

    return {
      posts: data,
      total: count ?? data.length,
      hasNext: data.length === limit,
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
  contents,
}: {
  postId: number;
  images: ImagePicker.ImagePickerAsset[];
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
    const imagesChanged = images.length !== existingPost.images.length;

    // 변경사항이 없으면 기존 게시글 반환
    if (!contentsChanged && !imagesChanged) {
      return existingPost;
    }

    // 이미지가 변경된 경우에만 새로 업로드
    let validImageUrls = existingPost.images;
    if (imagesChanged) {
      const imageUrls = await Promise.all(
        images.map((image) => uploadImage(image)),
      );
      validImageUrls = imageUrls.filter(
        (url): url is string => url !== undefined,
      );
    }

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

    const { data, error, count } = await supabase.rpc(
      "get_comments_with_top_reply",
      {
        postid: postId,
        startindex: start,
        endindex: end,
      },
    );

    if (error) throw error;
    if (!data) throw new Error("댓글을 가져올 수 없습니다.");

    return {
      comments: data,
      total: count ?? 0,
      hasNext: count ? end + 1 < count : false,
      nextPage: page + 1,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "댓글 조회에 실패했습니다",
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
}: {
  postId: number;
  contents: string;
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

// ============================================
//
//                    friend
//
// ============================================

// 친구 조회
export async function getFriends({
  offset = 0,
  limit = 12,
}: {
  offset?: number;
  limit?: number;
}) {
  const user = { id: "8a49fc55-8604-4e9a-9c7d-b33a813f3344" };

  const { data, error, count } = await supabase
    .from("friendRequest")
    .select("to", { count: "exact" })
    .eq("from", user.id)
    .eq("isAccepted", true)
    .order("createdAt", { ascending: false }) // NOTE order 추후 변경 가능
    .range(offset, offset + limit - 1);

  if (error) throw error;
  if (!data) throw new Error("친구를 불러올 수 없습니다.");

  const friends = await Promise.all(data.map(() => getUser()));

  return {
    data: friends,
    total: count || 0,
    hasMore: count ? offset + limit < count : false,
  };
}

// 친구요청 조회 조회
export async function getFriendRequests({
  offset = 0,
  limit = 12,
}: {
  offset?: number;
  limit?: number;
}) {
  // 현재 로그인된 사용자 정보 가져오기
  // const {
  //   data: { user },
  //   error: userError,
  // } = await supabase.auth.getUser();

  // if (userError) throw userError;
  // if (!user) throw new Error("유저 정보를 찾을 수 없습니다.");
  const user = { id: "8a49fc55-8604-4e9a-9c7d-b33a813f3344" };

  const { data, error, count } = await supabase
    .from("friendRequest")
    .select(
      `
          id,
          from,
          to
        `,
      { count: "exact" },
    )
    .eq("to", user.id)
    .is("isAccepted", null)
    .order("createdAt", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // FIXME 개선 필요
  const fromUsers = await Promise.all(data.map(() => getUser()));

  return {
    data: data.map((request, idx) => ({
      requestId: request.id.toString(),
      toUserId: request.to,
      fromUser: fromUsers[idx],
    })),
    total: count || 0,
    hasMore: count ? offset + limit < count : false,
  };
}

// 친구요청 생성
export async function createFriendRequest(
  from: string,
  to: string,
  isAccepted: boolean,
) {
  try {
    const { error } = await supabase
      .from("friendRequest")
      .insert({ from, to, isAccepted });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "친구 요청 생성에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// 친구요청 반응 업데이트
export async function putFriendRequest(requestId: string, isAccepted: boolean) {
  try {
    const { error } = await supabase
      .from("friendRequest")
      .update({ isAccepted })
      .eq("id", requestId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "친구 요청 수정에 실패했습니다";
    throw new Error(errorMessage);
  }
}

export async function deleteFriendRequest(requestId: string) {
  try {
    await supabase.from("friendRequest").delete().eq("id", requestId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "친구 요청 삭제에 실패했습니다";
    throw new Error(errorMessage);
  }
}
