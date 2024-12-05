import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import CustomModal from "@/components/Modal";
import { createPost, getPost, updatePost } from "@/utils/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useFetchData from "@/hooks/useFetchData";

export default function Upload() {
  const params = useLocalSearchParams<{ postId?: string }>();
  const postId = params.postId ? Number(params.postId) : undefined;
  const router = useRouter();
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [contents, setContents] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const post = useFetchData(
    ["post", postId],
    () => (postId ? getPost(postId) : Promise.resolve(null)),
    "게시글을 불러오는 도중 에러가 발생했습니다.",
    postId !== undefined,
  );

  useEffect(() => {
    if (post.data !== null && post.data !== undefined) {
      setImages(
        post.data.images.map(
          (uri: string) => ({ uri }) as ImagePicker.ImagePickerAsset,
        ),
      );
      setContents(post.data.contents ?? "");
    }
  }, [post.data]);

  const uploadPostMutation = useMutation({
    mutationFn: () => createPost({ contents, images }),
    onSuccess: () => {
      setImages([]);
      setContents("");

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      Alert.alert("업로드 성공", "게시물이 성공적으로 업로드되었습니다.");
      router.back();
    },
    onError: () => {
      Alert.alert("업로드 실패", "게시물 업로드에 실패했습니다.");
    },
  });

  const editPostMutation = useMutation({
    mutationFn: () => {
      if (!postId) {
        throw new Error("게시물 ID가 없습니다.");
      }
      return updatePost({ postId, contents, images });
    },
    onSuccess: () => {
      setImages([]);
      setContents("");

      queryClient.invalidateQueries({ queryKey: ["posts"] });

      Alert.alert("수정 성공", "게시물이 성공적으로 수정되었습니다.");
      router.back();
    },
    onError: () => {
      Alert.alert("수정 실패", "게시물 수정에 실패했습니다.");
    },
  });

  const handleUpload = async () => {
    if (images.length === 0) {
      Alert.alert("알림", "이미지를 추가해주세요.");
      return;
    }

    if (uploadPostMutation.isPending || editPostMutation.isPending) return;

    if (postId) {
      editPostMutation.mutate();
    } else {
      uploadPostMutation.mutate();
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

    if (images.length >= 5) {
      Alert.alert("알림", "이미지는 최대 5개까지 선택 가능합니다.");
      return;
    }
    // 권한 요청
    const { status, accessPrivileges } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted" && accessPrivileges !== "limited") {
      Alert.alert(
        "전체 사진 접근 권한 필요",
        "앱에서 모든 사진에 접근하려면 설정에서 권한을 변경해주세요.",
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

    if (images.length >= 5) {
      Alert.alert("알림", "이미지는 최대 5개까지 선택 가능합니다.");
      return;
    }
    // 카메라 권한 요청
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("카메라 접근 권한이 필요합니다.");
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

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-shrink-0 flex-grow-0"
      >
        <View className="w-full flex-row gap-4 p-6">
          {/* 선택된 이미지 표시 */}
          {images.map((image, index) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={`upload-image-${index}`}
              className="relative"
            >
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

          {images.length < 5 && (
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
          disabled={uploadPostMutation.isPending || images.length === 0}
        >
          <Text className="heading-2 text-white">
            {uploadPostMutation.isPending ? "인증중..." : "인증"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
