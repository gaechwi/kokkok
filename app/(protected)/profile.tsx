import CustomModal from "@/components/Modal";
import Icons from "@/constants/icons";
import useFetchData from "@/hooks/useFetchData";
import { getCurrentUser, updateMyProfile } from "@/utils/supabase";
import images from "@constants/images";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Profile = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: currentUser } = useFetchData(
    ["currentUser"],
    getCurrentUser,
    "현재 사용자를 불러올 수 없습니다.",
  );

  const [profileInput, setProfileInput] = useState({
    avatarUrl: currentUser?.avatarUrl || "",
    username: currentUser?.username || "",
    description: currentUser?.description || "",
  });

  // profile 데이터가 로드되면 input 값을 업데이트
  useEffect(() => {
    if (currentUser) {
      setProfileInput({
        avatarUrl: currentUser.avatarUrl || "",
        username: currentUser.username || "",
        description: currentUser.description || "",
      });
    }
  }, [currentUser]);

  const router = useRouter();

  const handleEditProfile = async () => {
    if (profileInput.username.trim().length < 3) {
      Alert.alert("닉네임은 3글자 이상이어야 합니다.");
      return;
    }

    await updateMyProfile({
      ...profileInput,
      avatarUrl: profileInput.avatarUrl
        ? { uri: profileInput.avatarUrl, width: 500, height: 500 }
        : undefined,
    });

    router.replace("/mypage");
  };

  const handleAvatarPress = async () => {
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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileInput({
        ...profileInput,
        avatarUrl: result.assets[0].uri,
      });
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="h-full flex-1 bg-white"
      >
        <ScrollView>
          <View className="mt-12 flex items-center justify-center px-6">
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              className="relative"
            >
              <Image
                source={
                  profileInput.avatarUrl
                    ? { uri: profileInput.avatarUrl }
                    : images.AvatarInput
                }
                className="size-[236px] rounded-full"
                resizeMode="cover"
              />
              <Icons.CameraIcon
                style={{ position: "absolute", bottom: 12, right: 14 }}
              />
            </TouchableOpacity>

            <View className="mt-10 flex w-full gap-10">
              <TextInput
                className="placeholder:body-1 h-[58px] w-full rounded-[10px] border border-gray-20 px-4 focus:border-primary"
                placeholder="닉네임을 입력해주세요."
                accessibilityLabel="닉네임 입력"
                accessibilityHint="닉네임을 입력해주세요."
                value={profileInput.username}
                onChangeText={(text) =>
                  setProfileInput({ ...profileInput, username: text })
                }
              />
              <TextInput
                className="placeholder:body-1 h-[108px] w-full rounded-[10px] border border-gray-20 p-4 focus:border-primary"
                placeholder="소개글을 입력해주세요."
                accessibilityLabel="소개글 입력"
                accessibilityHint="소개글을 입력해주세요."
                multiline={true} // 여러 줄 입력 가능
                numberOfLines={4} // 기본 표시 줄 수
                value={profileInput.description}
                onChangeText={(text) =>
                  setProfileInput({ ...profileInput, description: text })
                }
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              className="mt-12 h-[62px] w-full items-center justify-center rounded-[10px] bg-primary"
              onPress={handleEditProfile}
            >
              <Text className="heading-2 text-white">완료</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        position="middle"
      >
        <View className="w-full items-center">
          <TouchableOpacity
            className="h-[82px] w-full items-center justify-center border-gray-20 border-b"
            onPress={async () => {
              await handleAvatarPress();
              setIsModalVisible(false);
            }}
          >
            <Text className="title-2 text-gray-90">앨범 선택</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="h-[82px] w-full items-center justify-center"
            onPress={() => {
              setProfileInput({
                ...profileInput,
                avatarUrl: "",
              });

              setIsModalVisible(false);
            }}
          >
            <Text className="title-2 text-gray-90">이미지 삭제</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    </>
  );
};

export default Profile;
