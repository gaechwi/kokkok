import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import images from "@constants/images";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile, supabase, updateMyProfile } from "@/utils/supabase";

const Profile = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: () => getMyProfile(session?.user?.id!),
    enabled: !!session?.user?.id,
  });

  const [profileInput, setProfileInput] = useState({
    username: profile?.username || "",
    description: profile?.description || "",
  });

  // profile 데이터가 로드되면 input 값을 업데이트
  useEffect(() => {
    if (profile) {
      setProfileInput({
        username: profile.username || "",
        description: profile.description || "",
      });
    }
  }, [profile]);

  const router = useRouter();

  const handleEditProfile = async () => {
    await updateMyProfile(session?.user?.id!, profileInput);
    router.replace("/mypage");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="h-full flex-1 bg-white"
    >
      <ScrollView>
        <View className="mt-12 flex items-center justify-center px-6">
          <TouchableOpacity>
            <Image
              source={images.AvatarInput}
              className="size-[236px]"
              resizeMode="contain"
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
  );
};

export default Profile;
