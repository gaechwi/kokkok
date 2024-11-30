import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createPost } from "@/utils/appwrite";
import { useRouter } from "expo-router";
import CustomModal from "@/components/Modal";

export default function Upload() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [content, setContent] = useState<string | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleUpload = async () => {
    try {
      if (images.length === 0) {
        Alert.alert("알림", "이미지를 추가해주세요.");
        return;
      }

      if (content === "") setContent(undefined);

      setIsUploading(true);

      await createPost({
        content,
        images,
      });

      setImages([]);
      setContent(undefined);

      Alert.alert("업로드 성공", "게시물이 성공적으로 업로드되었습니다.");
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert("업로드 실패", "게시물 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    if (isUploading) return;
    if (images.length >= 5) {
      Alert.alert("알림", "이미지는 최대 5개까지 선택 가능합니다.");
      return;
    }
    // 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("갤러리 접근 권한이 필요합니다.");
      return;
    }

    // 이미지 선택 모달 표시
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const takePhoto = async () => {
    if (isUploading) return;
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
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    if (isUploading) return;
    setImages(images.filter((_, index) => index !== indexToDelete));
  };

  return (
    <View className="bg-white">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                disabled={isUploading}
              >
                <Icons.DeleteIcon width={16} height={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}

          {images.length < 5 && (
            <>
              <TouchableOpacity
                className="size-[152px] items-center justify-center rounded-[10px] bg-gray-20"
                onPress={() => setIsModalVisible(true)}
                disabled={isUploading}
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
          value={content}
          onChangeText={setContent}
          editable={!isUploading}
        />
      </View>

      <View className="px-6">
        <TouchableOpacity
          className="mt-8 h-[62px] w-full items-center justify-center rounded-[10px] bg-primary disabled:bg-gray-20"
          onPress={handleUpload}
          disabled={isUploading || images.length === 0}
        >
          <Text className="heading-2 text-white">
            {isUploading ? "인증중..." : "인증"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
