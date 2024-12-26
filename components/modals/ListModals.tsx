import useManageFriend from "@/hooks/useManageFriend";
import { useModal } from "@/hooks/useModal";
import { RELATION_TYPE, type RelationType } from "@/types/Friend.interface";
import type { ListButton, ModalPosition } from "@/types/Modal.interface";
import optimizeImage from "@/utils/optimizeImage";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert, Platform, Text, TouchableOpacity } from "react-native";
import { View } from "react-native";
import type { FlatList } from "react-native-gesture-handler";
import { showToast } from "../ToastConfig";

export function ListModal({
  position,
  buttons,
}: {
  position: ModalPosition;
  buttons: ListButton[];
}) {
  return (
    <View className={position === "center" ? "px-[46px]" : ""}>
      <View
        className={`items-center bg-white ${position === "center" ? "rounded-xl" : "rounded-t-xl"}`}
      >
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={button.text}
            className={`h-[82px] w-full items-center justify-center ${
              index !== buttons.length - 1 ? "border-gray-20 border-b" : ""
            } ${button.className || ""}`}
            onPress={async () => {
              await button.onPress();
            }}
          >
            <Text className="title-2 text-gray-90">{button.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function SelectPostEditDeleteModal({
  position,
  postId,
}: { position: ModalPosition; postId: number }) {
  const { openModal, closeModal } = useModal();
  const router = useRouter();

  return (
    <ListModal
      position={position}
      buttons={[
        {
          text: "수정",
          onPress: () => {
            closeModal();
            router.push(`/upload?postId=${postId}`);
          },
        },
        {
          text: "삭제",
          onPress: () => {
            openModal({ type: "DELETE_POST", postId }, "center");
          },
        },
      ]}
    />
  );
}

export function SelectCommentDeleteModal({
  position,
  postId,
  commentId,
}: { position: ModalPosition; postId: number; commentId: number }) {
  const { openModal } = useModal();

  return (
    <ListModal
      position={position}
      buttons={[
        {
          text: "삭제",
          onPress: () => {
            openModal({ type: "DELETE_COMMENT", postId, commentId }, "center");
          },
        },
      ]}
    />
  );
}

interface ProfileEditModalProps {
  setProfileInput: React.Dispatch<
    React.SetStateAction<{
      avatarUrl: string;
      username: string;
      description: string;
    }>
  >;
}

export function SelectProfileImageEditModal({
  setProfileInput,
}: ProfileEditModalProps) {
  const { closeModal } = useModal();

  const handleAvatarPress = async () => {
    const { status, accessPrivileges } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted" && accessPrivileges !== "limited") {
      Alert.alert(
        "사진 접근 권한 필요",
        "사진을 업로드하기 위해 사진 라이브러리 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
        [
          { text: "취소", style: "cancel" },
          {
            text: "설정으로 이동",
            onPress: () => Linking.openURL("app-settings:"),
          },
        ],
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileInput((prev) => ({
        ...prev,
        avatarUrl: result.assets[0].uri,
      }));
    }
  };

  return (
    <ListModal
      position="center"
      buttons={[
        {
          text: "앨범 선택",
          onPress: async () => {
            await handleAvatarPress();
            closeModal();
          },
        },
        {
          text: "이미지 삭제",
          onPress: () => {
            setProfileInput((prev) => ({
              ...prev,
              avatarUrl: "",
            }));
            closeModal();
          },
        },
      ]}
    />
  );
}

export function SelectProfileEditModal() {
  const { closeModal } = useModal();
  const router = useRouter();

  return (
    <ListModal
      position={"bottom"}
      buttons={[
        {
          text: "수정하기",
          onPress: () => {
            closeModal();
            router.push("/profile");
          },
        },
      ]}
    />
  );
}

export interface ImageItem {
  type: "prev" | "new";
  index: number;
  uri: string;
  imagePickerAsset?: ImagePicker.ImagePickerAsset;
}

export const IMAGE_LIMIT = 5;
export const IMAGE_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.5,
  exif: false,
  legacy: Platform.OS === "android",
};

export function SelectPostUploadImageModal({
  imageItems,
  setImageItems,
  flatListRef,
  isLoading,
}: {
  imageItems: ImageItem[];
  setImageItems: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  flatListRef: React.RefObject<FlatList<ImageItem>>;
  isLoading: boolean;
}) {
  const { closeModal } = useModal();

  // 이미지 처리 함수
  const handleImageProcess = useCallback(
    async (result: ImagePicker.ImagePickerResult) => {
      if (result.canceled) return;

      try {
        // 이미지 최적화
        const optimizedUri = await optimizeImage(result.assets[0].uri);
        const newImage: ImageItem = {
          type: "new",
          uri: optimizedUri,
          index: imageItems.length,
          imagePickerAsset: {
            ...result.assets[0],
            uri: optimizedUri,
            mimeType: "image/webp",
            width: 520,
            height: 520,
          },
        };
        setImageItems((prev) => [...prev, newImage]);

        // 이미지 추가 후 자동 스크롤
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        showToast("fail", "이미지 처리 중 오류가 발생했습니다.");
      }
    },
    [imageItems, setImageItems, flatListRef],
  );

  // 카메라나 갤러리 접근 권한 확인 함수
  const checkPermission = useCallback(async (type: "camera" | "gallery") => {
    const permissionFn =
      type === "camera"
        ? ImagePicker.requestCameraPermissionsAsync
        : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permissionFn();

    if (status !== "granted") {
      Alert.alert(
        `${type === "camera" ? "카메라" : "사진"} 접근 권한 필요`,
        `${type === "camera" ? "카메라를 사용" : "사진을 업로드"}하기 위해 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.`,
        [
          { text: "취소", style: "cancel" },
          { text: "설정으로 이동", onPress: () => Linking.openSettings() },
        ],
      );
      return false;
    }
    return true;
  }, []);

  // 이미지 선택 함수
  const pickImage = async () => {
    if (isLoading || imageItems.length >= IMAGE_LIMIT) {
      showToast("fail", "이미지는 5개까지 선택가능해요");
      return;
    }

    if (!(await checkPermission("gallery"))) return;
    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_OPTIONS);
    await handleImageProcess(result);
  };

  // 카메라로 사진 촬영 함수
  const takePhoto = async () => {
    if (isLoading || imageItems.length >= IMAGE_LIMIT) {
      showToast("fail", "이미지는 5개까지 선택가능해요");
      return;
    }

    if (!(await checkPermission("camera"))) return;
    const result = await ImagePicker.launchCameraAsync(IMAGE_OPTIONS);
    await handleImageProcess(result);
  };

  return (
    <ListModal
      position={"center"}
      buttons={[
        {
          text: "갤러리",
          onPress: async () => {
            await pickImage();
            closeModal();
          },
        },
        {
          text: "카메라",
          onPress: async () => {
            await takePhoto();
            closeModal();
          },
        },
      ]}
    />
  );
}

export function SelectFriendRequestModal({
  userId,
  relation,
}: { userId: string; relation: RelationType }) {
  const { useUnfriend, useAcceptRequest, useCreateRequest } = useManageFriend();
  const { mutate: handleUnfriend } = useUnfriend();
  const { mutate: handleAccept } = useAcceptRequest();
  const { mutate: handleCreate } = useCreateRequest();
  const { closeModal } = useModal();

  const BUTTON_CONFIG = {
    [RELATION_TYPE.FRIEND]: {
      message: "친구 끊기",
      onPress: () => handleUnfriend({ toUserId: userId }),
    },
    [RELATION_TYPE.ASKING]: {
      message: "친구 요청 취소",
      onPress: () => handleUnfriend({ toUserId: userId }),
    },
    [RELATION_TYPE.ASKED]: {
      message: "친구 요청 수락",
      onPress: () => handleAccept({ fromUserId: userId }),
    },
    [RELATION_TYPE.NONE]: {
      message: "친구 요청",
      onPress: () => handleCreate({ toUserId: userId }),
    },
  };

  return (
    <View className="items-center rounded-t-xl bg-white ">
      <TouchableOpacity
        className="h-[82px] w-full items-center justify-center"
        onPress={() => {
          BUTTON_CONFIG[relation].onPress();
          closeModal();
        }}
      >
        <Text className="title-2 text-gray-90">
          {BUTTON_CONFIG[relation].message}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
