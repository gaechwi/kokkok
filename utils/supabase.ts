import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";
import type { FriendResponse, RequestResponse } from "@/types/Friend.interface";
import type { User } from "@/types/User.interface";
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
export async function getUser(id: string): Promise<User> {
  try {
    const { data, error } = await supabase
      .from("user")
      .select()
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new Error("유저를 불러올 수 없습니다.");

    return {
      ...data,
      avatarUrl: data.avatarUrl || "",
      description: data.description || "",
    };
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
export async function getPosts({
  page = 0,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) {
  try {
    const start = page * limit;
    const end = start + limit - 1;

    const {
      data,
      error: postsError,
      count,
    } = await supabase
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
        { count: "exact" },
      )
      .order("createdAt", { ascending: false })
      .range(start, end);

    if (postsError) throw postsError;
    if (!data) throw new Error("게시글을 불러올 수 없습니다.");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const posts = await Promise.all(
      data.map(async (post) => {
        const {
          data: comment,
          error: commentError,
          count,
        } = await supabase
          .from("comment")
          .select(
            "id, contents, likes, author:user (id, username, avatarUrl)",
            { count: "exact" },
          )
          .eq("postId", post.id)
          .order("likes", { ascending: false })
          .order("createdAt", { ascending: false })
          .limit(1)
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
            .eq("postId", post.id)
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
      }),
    );

    return {
      posts,
      total: count ?? 0,
      hasNext: data.length === limit,
      nextPage: page + 1,
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

    const { data, error, count } = await supabase
      .from("comment")
      .select(
        `
          id, 
          contents,
          userId, 
          createdAt, 
          user (id, username, avatarUrl)
        `,
        { count: "exact" },
      )
      .eq("postId", postId)
      // .order("likes", { ascending: false })
      .order("createdAt", { ascending: false })
      .range(start, end);

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

export async function createComment({
  userId,
  postId,
  contents,
}: {
  userId: string;
  postId: number;
  contents: string;
}) {
  const { data, error } = await supabase
    .from("comment")
    .insert({ postId, contents, userId })
    .single();

  if (error) throw error;
  if (!data) throw new Error("댓글을 생성할 수 없습니다.");

  return data;
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
}): Promise<FriendResponse> {
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

  const friends = await Promise.all(data.map((request) => getUser(request.to)));

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
}): Promise<RequestResponse> {
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
  const fromUsers = await Promise.all(
    data.map((request) => getUser(request.from)),
  );

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
