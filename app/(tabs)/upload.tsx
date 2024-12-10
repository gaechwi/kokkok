import CustomModal, { OneButtonModal } from "@/components/Modal";
import { showToast } from "@/components/ToastConfig";
import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import useFetchData from "@/hooks/useFetchData";
import { formatDate } from "@/utils/formatDate";
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
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Upload() {
  const params = useLocalSearchParams<{ postId?: string }>();
  const postId = params.postId ? Number(params.postId) : undefined;
  const router = useRouter();
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [prevImages, setPrevImages] = useState<string[]>([]);
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
            setPrevImages(data.data?.images ?? []);
            setContents(data.data?.contents ?? "");
          } else {
            setPrevImages([]);
            setContents("");
          }
        });
      }
    }, [postId, post.refetch]),
  );

  useEffect(() => {
    if (post.data !== null && post.data !== undefined) {
      setPrevImages(post.data.images ?? []);
      setContents(post.data.contents ?? "");
    } else {
      setPrevImages([]);
      setContents("");
    }
  }, [post.data]);

  const uploadPostMutation = useMutation({
    mutationFn: () => {
      return createPost({ contents, images });
    },
    onSuccess: () => {
      setImages([]);
      setPrevImages([]);
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

      return updatePost({ postId, contents, images, prevImages });
    },
    onSuccess: () => {
      showToast("success", "글이 수정되었어요!");

      setImages([]);
      setPrevImages([]);
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
    if (images.length === 0 && prevImages.length === 0) {
      Alert.alert("알림", "이미지를 추가해주세요.");
      return;
    }

    if (uploadPostMutation.isPending || addWorkoutHistoryMutation.isPending || editPostMutation.isPending)
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
    quality: 0.8,
    exif: false,
  };

  const pickImage = async () => {
    if (uploadPostMutation.isPending) return;

    const totalImages = images.length + prevImages.length;
    if (totalImages >= 5) {
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
            onPress: () => Linking.openURL("app-settings:"),
          },
        ],
      );
      return;
    }

    // 이미지 선택 모달 표시
    const result = await ImagePicker.launchImageLibraryAsync(imageOptions);

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const takePhoto = async () => {
    if (uploadPostMutation.isPending) return;

    const totalImages = images.length + prevImages.length;
    if (totalImages >= 5) {
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
            onPress: () => Linking.openURL("app-settings:"),
          },
        ],
      );
      return;
    }

    // 카메라 실행
    const result = await ImagePicker.launchCameraAsync(imageOptions);

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    if (uploadPostMutation.isPending) return;
    setImages(images.filter((_, index) => index !== indexToDelete));
  };

  const handleDeletePrevImage = (indexToDelete: number) => {
    if (uploadPostMutation.isPending) return;
    setPrevImages(prevImages.filter((_, index) => index !== indexToDelete));
  };

  const hasContentChanged = post.data?.contents !== contents;
  const hasImagesChanged =
    images.length > 0 ||
    prevImages.length !== post.data?.images?.length ||
    prevImages.some((img, idx) => img !== post.data?.images?.[idx]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-shrink-0 flex-grow-0"
      >
        <View className="w-full flex-row gap-4 p-6">
          {/* 이전 이미지 표시 */}
          {prevImages.map((image, index) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={`prev-image-${index}`}
              className="relative"
            >
              <Image
                source={{ uri: image }}
                className="size-[152px] rounded-[10px]"
              />
              <TouchableOpacity
                className="-top-3 -right-3 absolute size-8 items-center justify-center rounded-full border-2 border-white bg-gray-25"
                onPress={() => handleDeletePrevImage(index)}
                disabled={uploadPostMutation.isPending}
              >
                <Icons.XIcon width={16} height={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}

          {/* 새로 선택된 이미지 표시 */}
          {images.map((image, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <View key={`upload-image-${index}`} className="relative">
              <Image
                source={{ uri: image.uri }}
                className="size-[152px] rounded-[10px]"
              />
              <TouchableOpacity
                className="-top-3 -right-3 absolute size-8 items-center justify-center rounded-full border-2 border-white bg-gray-25"
                onPress={() => handleDeleteImage(index)}
                disabled={uploadPostMutation.isPending}
              >
                <Icons.XIcon width={16} height={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}

          {/* 이미지 추가 버튼 - 총 이미지 개수가 5개 미만일 때만 표시 */}
          {images.length + prevImages.length < 5 && (
            <>
              <TouchableOpacity
                className="size-[152px] items-center justify-center rounded-[10px] bg-gray-20"
                onPress={() => setIsModalVisible(true)}
                disabled={uploadPostMutation.isPending}
              >
                <Icons.PlusIcon width={24} height={24} color={colors.white} />
              </TouchableOpacity>

              <CustomModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                position="middle"
              >
                <View className="w-full items-center">
                  <TouchableOpacity
                    className="h-[82px] w-full items-center justify-center border-gray-20 border-b"
                    onPress={() => {
                      setIsModalVisible(false);
                      takePhoto();
                    }}
                  >
                    <Text className="title-2 text-gray-90">카메라</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="h-[82px] w-full items-center justify-center"
                    onPress={() => {
                      setIsModalVisible(false);
                      pickImage();
                    }}
                  >
                    <Text className="title-2 text-gray-90">갤러리</Text>
                  </TouchableOpacity>
                </View>
              </CustomModal>
            </>
          )}
        </View>
      </ScrollView>

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
              ? // 수정 모드일 때
                !hasContentChanged && !hasImagesChanged
              : // 새 게시물 작성 모드일 때
                images.length === 0 &&
                prevImages.length === 0 &&
                contents === "")
          }
        >
          <Text className="heading-2 text-white">
            {uploadPostMutation.isPending ? "인증중..." : "인증"}
          </Text>
        </TouchableOpacity>
      </View>

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
  );
}
