import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";

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
      .from("users")
      .insert([
        {
          id: authData.user.id,
          email,
          username,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`,
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
}: {
  email: string;
  password: string;
}) {
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
}: {
  contents?: string;
  images: ImagePicker.ImagePickerAsset[];
}) {
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
