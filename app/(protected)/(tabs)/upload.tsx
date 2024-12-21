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
import { useCallback, useEffect, useState } from "react";
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
  type DragEndParams,
  type RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

interface ImageItem {
  type: "prev" | "new";
  index: number;
  uri: string;
  imagePickerAsset?: ImagePicker.ImagePickerAsset;
}

export default function Upload() {
  const params = useLocalSearchParams<{ postId?: string }>();
  const postId = params.postId ? Number(params.postId) : undefined;
  const router = useRouter();
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [contents, setContents] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const post = useFetchData(
    ["post", postId],
    () => (postId ? getPost(postId) : Promise.resolve(null)),
    "게시글을 불러오는 도중 에러가 발생했습니다.",
    postId !== undefined,
  );

  useFocusEffect(
    useCallback(() => {
      if (postId) {
        post.refetch().then((data) => {
          if (data !== null && data !== undefined) {
            const prevImageItems: ImageItem[] = (data.data?.images ?? []).map(
              (uri, index) => ({
                type: "prev",
                uri,
                index,
              }),
            );
            setImageItems(prevImageItems);
            setContents(data.data?.contents ?? "");
          } else {
            setImageItems([]);
            setContents("");
          }
        });
      } else {
        setImageItems([]);
        setContents("");
      }
    }, [postId, post.refetch]),
  );

  useEffect(() => {
    if (post.data !== null && post.data !== undefined) {
      const prevImageItems: ImageItem[] = (post.data.images ?? []).map(
        (uri, index) => ({
          type: "prev",
          uri,
          index,
        }),
      );
      setImageItems(prevImageItems);
      setContents(post.data.contents ?? "");
    } else {
      setImageItems([]);
      setContents("");
    }
  }, [post.data]);

  const uploadPostMutation = useMutation({
    mutationFn: () => {
      const newImages = imageItems
        .filter((item) => item.type === "new")
        .map((item) => item.imagePickerAsset!)
        .filter(Boolean);
      return createPost({ contents, images: newImages });
    },
    onSuccess: () => {
      setImageItems([]);
      setContents("");

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      showToast("success", "글이 작성되었어요!");
      router.back();
    },
    onError: () => {
      setIsInfoModalVisible(true);
    },
  });

  const addWorkoutHistoryMutation = useMutation({
    mutationFn: () => {
      const date = formatDate(new Date());

      return addWorkoutHistory({
        date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["histories"] });
    },
    onError: () => {
      setIsInfoModalVisible(true);
    },
  });

  const editPostMutation = useMutation({
    mutationFn: () => {
      if (!postId) {
        throw new Error("게시물 ID가 없습니다.");
      }

      // 이미지 순서대로 정렬
      const sortedImages = imageItems.sort((a, b) => a.index - b.index);

      // 이전 이미지와 새 이미지 분리
      const prevImages = sortedImages
        .filter((item) => item.type === "prev")
        .map((item) => ({
          uri: item.uri,
          index: item.index,
        }));

      const newImages = sortedImages
        .filter((item) => item.type === "new")
        .map((item) => ({
          imagePickerAsset: item.imagePickerAsset!,
          index: item.index,
        }));

      return updatePost({
        postId,
        contents,
        images: newImages,
        prevImages: prevImages,
      });
    },
    onSuccess: () => {
      showToast("success", "글이 수정되었어요!");

      setImageItems([]);
      setContents("");

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      router.push("/home");
    },
    onError: () => {
      setIsInfoModalVisible(true);
    },
  });

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
        await editPostMutation.mutateAsync();
      } else {
        // 게시글 인증 먼저 시도
        await addWorkoutHistoryMutation.mutateAsync();

        // 인증 성공 시 게시글 업로드 시도
        await uploadPostMutation.mutateAsync();
      }
    } catch (error) {
      setIsInfoModalVisible(true);
    }
  };

  const imageOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
    exif: false,
    legacy: Platform.OS === "android",
  };

  const pickImage = async () => {
    if (uploadPostMutation.isPending) return;

    if (imageItems.length >= 5) {
      showToast("fail", "이미지는 5개까지 선택가능해요");

      return;
    }

    // 권한 요청
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
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return;
    }

    // 이미지 선택 모달 표시
    const result = await ImagePicker.launchImageLibraryAsync(imageOptions);

    if (!result.canceled) {
      try {
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
      } catch (error) {
        showToast("fail", "이미지 최적화 중 오류가 발생했습니다.");
      }
    }
  };

  const takePhoto = async () => {
    if (uploadPostMutation.isPending) return;

    if (imageItems.length >= 5) {
      showToast("fail", "이미지는 5개까지 선택가능해요");
      return;
    }
    // 카메라 권한 요청
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "카메라 접근 권한 필요",
        "앱에서 카메라에 접근하려면 설정에서 권한을 변경해주세요.",
        [
          { text: "취소", style: "cancel" },
          {
            text: "설정으로 이동",
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return;
    }

    // 카메라 실행
    const result = await ImagePicker.launchCameraAsync(imageOptions);

    if (!result.canceled) {
      try {
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
      } catch (error) {
        showToast("fail", "이미지 최적화 중 오류가 발생했습니다.");
      }
    }
  };

  const handleDeleteImage = useCallback(
    (indexToDelete: number) => {
      if (uploadPostMutation.isPending) return;
      setImageItems((prev) =>
        prev.filter((_, index) => index !== indexToDelete),
      );
    },
    [uploadPostMutation.isPending],
  );

  const onDragEnd = ({ data }: DragEndParams<ImageItem>) => {
    const updatedData = data.map((item, index) => ({ ...item, index }));
    setImageItems(updatedData);
  };

  const renderItem = ({
    item,
    drag,
    getIndex,
  }: RenderItemParams<ImageItem>) => (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        delayLongPress={150}
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
          onPress={() => handleDeleteImage(getIndex() as number)}
          disabled={uploadPostMutation.isPending}
        >
          <Icons.XIcon width={16} height={16} color={colors.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  const hasContentChanged = post.data?.contents !== contents;
  const hasImagesChanged =
    imageItems.some((item) => item.type === "new") ||
    imageItems.length !== post.data?.images?.length ||
    imageItems
      .filter((item) => item.type === "prev")
      .some((item, idx) => item.uri !== post.data?.images?.[idx]);

  return (
    <>
      <View className="flex-1 bg-white">
        <DraggableFlatList
          horizontal
          data={imageItems}
          onDragEnd={onDragEnd}
          keyExtractor={(item: ImageItem, index: number) =>
            `${item.type}-${item.uri}-${index}`
          }
          renderItem={renderItem}
          className="flex-shrink-0 flex-grow-0 pt-6"
          contentContainerStyle={{ gap: 16 }}
          containerStyle={{ paddingHorizontal: 16 }}
          autoscrollSpeed={100}
          activationDistance={5}
          dragHitSlop={{ top: 0, bottom: 0, left: 20, right: 20 }}
          showsHorizontalScrollIndicator={false}
          dragItemOverflow={true}
          ListFooterComponent={useCallback(
            () =>
              imageItems.length < 5 ? (
                <TouchableOpacity
                  className="size-[152px] items-center justify-center rounded-[10px] bg-gray-20"
                  onPress={() => setIsModalVisible(true)}
                  disabled={uploadPostMutation.isPending}
                >
                  <Icons.PlusIcon width={24} height={24} color={colors.white} />
                </TouchableOpacity>
              ) : null,
            [imageItems.length, uploadPostMutation.isPending],
          )}
        />

        <View className="w-full items-center justify-center px-6 pt-7">
          <TextInput
            className="body-1 h-[120px] w-full rounded-[10px] border border-gray-20 p-4 "
            placeholder="자유롭게 글을 적어주세요. (선택)"
            placeholderTextColor={colors.gray[40]}
            multiline={true}
            textAlignVertical="top"
            value={contents}
            onChangeText={setContents}
            editable={!uploadPostMutation.isPending}
          />
        </View>

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
