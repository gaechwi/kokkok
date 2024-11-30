import {
  Client,
  Account,
  ID,
  Avatars,
  Databases,
  Storage,
} from "react-native-appwrite";
import type * as ImagePicker from "expo-image-picker";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "6745cbe60009517073ad",
  platform: "com.gaechwi.kokkok",
  databaseId: "6745cc64001d43c5d918",
  userCollectionId: "6745ccbf002e6b1ac24a",
  postCollectionId: "6745d1dd003250e09752",
  storageId: "6745ccfc002df68bf933",
};

const client: Client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

// 이미지 업로드
export async function uploadImage(
  file: ImagePicker.ImagePickerAsset,
  type: string,
) {
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
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      {
        name: file.fileName || "untitled",
        type: file.mimeType || "image/jpeg",
        size: file.fileSize || 0,
        uri: file.uri,
      },
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "파일 업로드에 실패했습니다.";
    throw new Error(errorMessage);
  }
}

// 이미지 조회
export async function getFilePreview(fileId: string, type: string) {
  let fileUrl: URL;

  try {
    if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        1000,
        1000,
        undefined,
        100,
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw new Error("파일 URL이 존재하지 않습니다.");

    return fileUrl;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? `getFilePreview: ${error.message}`
        : "파일 조회에 실패했습니다.";
    throw new Error(errorMessage);
  }
}

// 게시물 생성
export async function createPost(post: {
  contents?: string;
  images: ImagePicker.ImagePickerAsset[];
}) {
  try {
    const contents = post.contents === "" ? undefined : post.contents;

    const imageUrls = await Promise.all(
      post.images.map((image) => uploadImage(image, "image")),
    );
    const validImageUrls = imageUrls.filter(
      (url): url is URL => url !== undefined,
    );

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        contents,
        images: validImageUrls,
      },
    );

    return newPost;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? `createPost: ${error.message}`
        : "게시물 생성에 실패했습니다.";
    throw new Error(errorMessage);
  }
}
