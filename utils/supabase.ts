import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type Session } from "@supabase/supabase-js";
import type * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";
import type { RequestResponse, StatusInfo } from "@/types/Friend.interface";
import type { User, UserProfile } from "@/types/User.interface";
import type { Notification } from "@/types/Notification.interface";
import { formatDate } from "./formatDate";

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
  id: string | undefined;
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
export async function getUser(userId: string): Promise<User> {
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
export async function getCurrentUser(): Promise<User> {
  const { user } = await getCurrentSession();
  return await getUser(user.id);
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

// 게시물 생성
export async function createPost({
  contents,
  images,
}: { contents?: string; images: ImagePicker.ImagePickerAsset[] }) {
  try {
    // 현재 로그인된 사용자 정보 가져오기
    // const {
    //   data: { user },
    //   error: userError,
    // } = await supabase.auth.getUser();

    // if (userError) throw userError;
    // if (!user) throw new Error("유저 정보를 찾을 수 없습니다.");

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
          // user_id: user.id,
          contents: postContents,
          images: validImageUrls,
        },
      ])
      .select()
      .single();

    return newPost;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? `createPost: ${error.message}`
        : "게시물 생성에 실패했습니다.";
    throw new Error(errorMessage);
  }
}

// 게시글 조회
export async function getPosts({
  offset = 0,
  limit = 10,
}: {
  offset?: number;
  limit?: number;
}): Promise<{ posts: Post[]; total: number; hasMore: boolean }> {
  try {
    const {
      data: posts,
      error: postsError,
      count,
    } = await supabase
      .from("post")
      .select(
        `
        id,
        images,
        contents,
        created_at,
        likes
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) throw postsError;
    if (!posts) throw new Error("게시글을 불러올 수 없습니다.");

    return {
      posts: posts.map(
        (post): Post => ({
          id: post.id,
          images: post.images,
          contents: post.contents,
          createdAt: post.created_at,
          likes: post.likes,
        }),
      ),
      total: count || 0,
      hasMore: count ? offset + limit < count : false,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "게시글 조회에 실패했습니다";
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
  const { data, error } = await supabase
    .from("workoutHistory")
    .select("userId, status")
    .filter("userId", "in", `(${friendIds})`)
    .eq("date", formatDate(new Date()));

  if (error) throw error;
  if (!data) throw new Error("친구 운동 상태를 불러올 수 없습니다.");

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
  isAccepted: boolean,
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
  const userId = "bc329999-5b57-40ed-8d9d-dba4e88ca608";

  const startDateString = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0); // month+1의 0번째 날짜는 해당 월의 마지막 날
  const endDateString = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(
    endDate.getDate(),
  ).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("workoutHistory")
    .select("date, status")
    .eq("userId", userId)
    .gte("date", startDateString)
    .lte("date", endDateString)
    .order("date", { ascending: true });

  if (error) throw error;

  return data;
}

// 쉬는 날 조회
export async function getRestDays(): Promise<Pick<History, "date">[]> {
  const userId = "bc329999-5b57-40ed-8d9d-dba4e88ca608";

  const currentDate = new Date();
  const startOfMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("workoutHistory")
    .select("date")
    .eq("userId", userId)
    .eq("status", "rest")
    .gte("date", startOfMonth)
    .order("date", { ascending: true });

  if (error) throw error;

  return data;
}

// 쉬는 날 추가
export async function addRestDay(
  dates: Pick<History, "date">[],
): Promise<void> {
  const userId = "bc329999-5b57-40ed-8d9d-dba4e88ca608";

  const records = dates.map(({ date }) => ({
    userId,
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
  const userId = "bc329999-5b57-40ed-8d9d-dba4e88ca608";

  const days = dates.map((item) => item.date);

  const { data, error } = await supabase
    .from("workoutHistory")
    .delete()
    .eq("userId", userId)
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
