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

export async function uploadFile(
	file: ImagePicker.ImagePickerAsset,
	type: string,
) {
	if (!file) return;
	console.log(file);

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

export async function getFilePreview(fileId: string, type: string) {
	let fileUrl: URL;

	try {
		if (type === "video") {
			fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
		} else if (type === "image") {
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

		if (!fileUrl) throw Error;

		return fileUrl;
	} catch (error) {
		const errorMessage =
			error instanceof Error
				? `getFilePreview: ${error.message}`
				: "파일 조회에 실패했습니다.";
		throw new Error(errorMessage);
	}
}

export async function createPost(post: {
	content?: string;
	images: ImagePicker.ImagePickerAsset[];
}) {
	try {
		const imageUrls = await Promise.all(
			post.images.map((image) => uploadFile(image, "image")),
		);

		const newPost = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			ID.unique(),
			{
				content: post.content,
				images: imageUrls,
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
