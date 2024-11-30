import {
  Client,
  Account,
  ID,
  Avatars,
  Databases,
  Query,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "6745cbe60009517073ad",
  platform: "com.gaechwi.kokkok",
  databaseId: "6745cc64001d43c5d918",
  userCollectionId: "6745ccbf002e6b1ac24a",
  postCollectionId: "6745d1dd003250e09752",
};

const client: Client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// 회원가입
export async function signUp(
  email: string,
  password: string,
  username: string,
  description?: string,
) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username,
    );

    if (!newAccount) {
      throw new Error("계정 생성에 실패했습니다.");
    }

    const avatarUrl = avatars.getInitials(username);

    console.log("세션 생성 시작");
    const session = await signIn(email, password);
    if (!session) {
      throw new Error("자동 로그인에 실패했습니다");
    }

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
        description: description || null,
      },
    );

    return newUser;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "회원가입에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// 로그인
export async function signIn(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    if (!session) {
      throw new Error("로그인에 실패했습니다");
    }

    return session;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "로그인에 실패했습니다";
    throw new Error(errorMessage);
  }
}

// 게시글 조회
export async function getPosts({
  pageParam = 0,
  limit = 10,
}: { pageParam?: number; limit?: number }): Promise<{
  posts: Post[];
  total: number;
  hasMore: boolean;
}> {
  const offset = pageParam * limit;

  const posts = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
      Query.offset(offset),
      Query.select([
        "$id",
        "images",
        "contents",
        "$createdAt",
        "$updatedAt",
        "likes",
      ]),
    ],
  );

  return {
    posts: posts.documents.map((doc) => ({
      id: doc.$id,
      images: doc.images,
      contents: doc.contents,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
      likes: doc.likes,
    })),
    total: posts.total,
    hasMore: offset + limit < posts.total,
  };
}

// 게시글 타입 정의
interface Post {
  id: string;
  images: string[];
  contents: string;
  createdAt: string;
  updatedAt: string;
  likes: string[];
}
