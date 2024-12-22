import CustomModal, { OneButtonModal } from "@/components/Modal";
import { showToast } from "@/components/ToastConfig";
import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import useFetchData from "@/hooks/useFetchData";
import { formatDate } from "@/utils/formatDate";
import optimizeImage from "@/utils/optimizeImage";
import {
  addWorkoutHistory,
  createPost,
  getPost,
  updatePost,
} from "@/utils/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import type { FlatList } from "react-native-gesture-handler";

// 이미지 항목의 타입 정의
interface ImageItem {
  type: "prev" | "new";
  index: number;
  uri: string;
  imagePickerAsset?: ImagePicker.ImagePickerAsset;
}

// 이미지 최대 개수 및 옵션 설정
const IMAGE_LIMIT = 5;
const IMAGE_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.5,
  exif: false,
  legacy: Platform.OS === "android",
};

export default function Upload() {
  const params = useLocalSearchParams<{ postId?: string }>();
  const postId = params.postId ? Number(params.postId) : undefined;
  const router = useRouter();
  const queryClient = useQueryClient();

  // 상태 정의
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [contents, setContents] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const flatListRef = useRef<FlatList<ImageItem> | null>(null);

  // 게시글 데이터를 불러오는 훅
  const { data: post, refetch } = useFetchData(
    ["post", postId],
    () => (postId ? getPost(postId) : Promise.resolve(null)),
    "게시글을 불러오는 도중 에러가 발생했습니다.",
    postId !== undefined,
  );

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
    [imageItems.length],
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

  // 게시글 작성 뮤테이션
  const uploadPostMutation = useMutation({
    mutationFn: () => {
      const newImages = imageItems
        .filter((item) => item.type === "new")
        .map((item) => item.imagePickerAsset!)
        .filter(Boolean);
      return createPost({ contents, images: newImages });
    },
    onSuccess: () => {
      showToast("success", "글이 작성되었어요!");

      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });

      // 폼 초기화
      resetForm();

      router.back();
    },
    onError: () => setIsInfoModalVisible(true),
  });

  // 게시글 수정 뮤테이션
  const editPostMutation = useMutation({
    mutationFn: () => {
      if (!postId) throw new Error("게시물 ID가 없습니다.");

      const sortedImages = imageItems.sort((a, b) => a.index - b.index);
      const [prevImages, newImages] = sortedImages.reduce<
        [
          ImageItem[],
          { imagePickerAsset: ImagePicker.ImagePickerAsset; index: number }[],
        ]
      >(
        ([prev, next], item) => {
          if (item.type === "prev") {
            prev.push({
              uri: item.uri,
              index: item.index,
              type: "prev",
            });
          } else if (item.imagePickerAsset) {
            next.push({
              imagePickerAsset: item.imagePickerAsset,
              index: item.index,
            });
          }
          return [prev, next];
        },
        [[], []],
      );

      return updatePost({ postId, contents, images: newImages, prevImages });
    },
    onSuccess: () => {
      showToast("success", "글이 수정되었어요!");

      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });

      // 폼 초기화
      resetForm();

      router.push("/home");
    },
    onError: () => setIsInfoModalVisible(true),
  });

  // 운동 기록 추가 뮤테이션
  const addWorkoutHistoryMutation = useMutation({
    mutationFn: () => addWorkoutHistory({ date: formatDate(new Date()) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
    onError: () => setIsInfoModalVisible(true),
  });

  // 폼 초기화 함수
  const resetForm = useCallback(() => {
    setImageItems([]); // 이미지 목록 초기화
    setContents(""); // 내용 초기화
  }, []);

  // 게시글 업로드 처리
  const handleUpload = async () => {
    if (imageItems.length === 0) {
      Alert.alert("알림", "이미지를 추가해주세요.");
      return;
    }

    if (
      uploadPostMutation.isPending ||
      addWorkoutHistoryMutation.isPending ||
      editPostMutation.isPending
    )
      return;

    try {
      if (postId) {
        // 게시글 수정
        await editPostMutation.mutateAsync();
      } else {
        // 운동 기록 추가
        await addWorkoutHistoryMutation.mutateAsync();
        // 게시글 업로드
        await uploadPostMutation.mutateAsync();
      }
    } catch {
      setIsInfoModalVisible(true);
    }
  };

  // 이미지 선택 함수
  const pickImage = async () => {
    if (uploadPostMutation.isPending || imageItems.length >= IMAGE_LIMIT) {
      showToast("fail", "이미지는 5개까지 선택가능해요");
      return;
    }

    if (!(await checkPermission("gallery"))) return;
    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_OPTIONS);
    await handleImageProcess(result);
  };

  // 카메라로 사진 촬영 함수
  const takePhoto = async () => {
    if (uploadPostMutation.isPending || imageItems.length >= IMAGE_LIMIT) {
      showToast("fail", "이미지는 5개까지 선택가능해요");
      return;
    }

    if (!(await checkPermission("camera"))) return;
    const result = await ImagePicker.launchCameraAsync(IMAGE_OPTIONS);
    await handleImageProcess(result);
  };

  // 화면이 포커스될 때 게시글 불러오기
  useFocusEffect(
    useCallback(() => {
      // 게시글 ID가 없으면 폼 초기화
      if (!postId) {
        resetForm();
        return;
      }

      // 게시글 불러오기
      refetch().then((data) => {
        if (!data?.data) {
          resetForm();
          return;
        }

        const prevImageItems: ImageItem[] = (data.data.images ?? []).map(
          (uri, index) => ({ type: "prev", uri, index }),
        ); // 기존 이미지 목록 설정

        setImageItems(prevImageItems);
        setContents(data.data.contents ?? "");
      });
    }, [postId, refetch, resetForm]),
  );

  // 내용 변경 여부 확인
  const hasContentChanged = post?.contents !== contents;
  // 이미지 변경 여부 확인
  const hasImagesChanged =
    imageItems.some((item) => item.type === "new") || // 새 이미지 추가 여부
    imageItems.length !== post?.images?.length || // 이미지 개수 변경 여부
    imageItems
      .filter((item) => item.type === "prev")
      .some((item, idx) => item.uri !== post?.images?.[idx]); // 기존 이미지 변경 여부 확인

  return (
    <>
      <View className="flex-1 bg-white">
        {/* 이미지 리스트 (드래그 가능) */}
        <DraggableFlatList
          ref={flatListRef}
          horizontal
          data={imageItems}
          onDragEnd={({ data }) =>
            setImageItems(data.map((item, index) => ({ ...item, index })))
          }
          keyExtractor={(item, index) => `${item.type}-${item.uri}-${index}`}
          renderItem={({ item, drag, getIndex }) => (
            <ScaleDecorator>
              <TouchableOpacity
                onLongPress={drag}
                delayLongPress={200}
                activeOpacity={0.7}
                className="relative"
                disabled={uploadPostMutation.isPending}
              >
                <Image
                  source={{ uri: item.uri }}
                  className="size-[152px] rounded-[10px]"
                />
                <TouchableOpacity
                  className="-top-3 -right-3 absolute size-8 items-center justify-center rounded-full border-2 border-white bg-gray-25"
                  onPress={() =>
                    setImageItems((prev) =>
                      prev.filter((_, idx) => idx !== getIndex()),
                    )
                  }
                  disabled={uploadPostMutation.isPending}
                >
                  <Icons.XIcon width={16} height={16} color={colors.white} />
                </TouchableOpacity>
              </TouchableOpacity>
            </ScaleDecorator>
          )}
          className="flex-shrink-0 flex-grow-0 pt-6"
          contentContainerStyle={{ gap: 16 }}
          containerStyle={{ paddingHorizontal: 16 }}
          autoscrollSpeed={70}
          activationDistance={5}
          dragHitSlop={{ top: 0, bottom: 0, left: 10, right: 10 }}
          showsHorizontalScrollIndicator={false}
          dragItemOverflow={true}
          scrollEnabled={true}
          ListFooterComponent={
            imageItems.length < IMAGE_LIMIT ? (
              <TouchableOpacity
                className="size-[152px] items-center justify-center rounded-[10px] bg-gray-20"
                onPress={() => setIsModalVisible(true)}
                disabled={uploadPostMutation.isPending}
              >
                <Icons.PlusIcon width={24} height={24} color={colors.white} />
              </TouchableOpacity>
            ) : null
          }
        />

        {/* 글 입력란 */}
        <View className="w-full items-center justify-center px-6 pt-7">
          <TextInput
            className="body-1 h-[120px] w-full rounded-[10px] border border-gray-20 p-4"
            placeholder="자유롭게 글을 적어주세요. (선택)"
            placeholderTextColor={colors.gray[40]}
            multiline
            textAlignVertical="top"
            value={contents}
            onChangeText={setContents}
            editable={!uploadPostMutation.isPending}
          />
        </View>

        {/* 인증 버튼 */}
        <View className="px-6">
          <TouchableOpacity
            className="mt-8 h-[62px] w-full items-center justify-center rounded-[10px] bg-primary disabled:bg-gray-20"
            onPress={handleUpload}
            disabled={
              uploadPostMutation.isPending ||
              (postId
                ? !hasContentChanged && !hasImagesChanged
                : imageItems.length === 0 && contents === "")
            }
          >
            <Text className="heading-2 text-white">
              {uploadPostMutation.isPending ? "인증중..." : "인증"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isModalVisible && (
        <View className="flex-1">
          <CustomModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            position="middle"
          >
            <View className="w-full items-center">
              <TouchableOpacity
                className="h-[82px] w-full items-center justify-center border-gray-20 border-b"
                onPress={async () => {
                  await takePhoto();
                  setIsModalVisible(false);
                }}
              >
                <Text className="title-2 text-gray-90">카메라</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="h-[82px] w-full items-center justify-center"
                onPress={async () => {
                  await pickImage();
                  setIsModalVisible(false);
                }}
              >
                <Text className="title-2 text-gray-90">갤러리</Text>
              </TouchableOpacity>
            </View>
          </CustomModal>
        </View>
      )}

      {isInfoModalVisible && (
        <View className="flex-1">
          <OneButtonModal
            buttonText="확인"
            contents={"업로드에 실패했습니다 \n다시한번 시도해주세요"}
            isVisible={isInfoModalVisible}
            onClose={() => setIsInfoModalVisible(false)}
            onPress={() => setIsInfoModalVisible(false)}
            emoji="sad"
            key="upload-info-modal"
          />
        </View>
      )}
    </>
  );
}
