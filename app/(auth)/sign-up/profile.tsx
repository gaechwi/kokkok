import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import images from "@constants/images";
import { useAtom } from "jotai";
import { signUpFormAtom } from "@contexts/auth";
import { useRouter } from "expo-router";
import { signUp } from "@/utils/supabase";

const Profile = () => {
  const [signUpForm, setSignUpForm] = useAtom(signUpFormAtom);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!signUpForm.username) {
      Alert.alert("닉네임을 채워주세요");
      return;
    }

    try {
      await signUp({
        email: signUpForm.email,
        password: signUpForm.password,
        username: signUpForm.username,
        description: signUpForm.description,
      });

      router.replace("/home");
    } catch (error) {
      Alert.alert(
        "회원가입 실패",
        error instanceof Error ? error.message : "회원가입에 실패했습니다.",
      );
    }
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
              className="h-[58px] w-full rounded-[10px] border border-gray-20 px-4 focus:border-primary"
              placeholder="닉네임을 입력해주세요."
              accessibilityLabel="닉네임 입력"
              accessibilityHint="닉네임을 입력해주세요."
              value={signUpForm.username}
              onChangeText={(text) =>
                setSignUpForm({ ...signUpForm, username: text })
              }
            />
            <TextInput
              className="h-[108px] w-full rounded-[10px] border border-gray-20 p-4 focus:border-primary"
              placeholder="소개글을 입력해주세요."
              accessibilityLabel="소개글 입력"
              accessibilityHint="소개글을 입력해주세요."
              multiline={true} // 여러 줄 입력 가능
              numberOfLines={4} // 기본 표시 줄 수
              value={signUpForm.description}
              onChangeText={(text) =>
                setSignUpForm({ ...signUpForm, description: text })
              }
            />
          </View>

          <TouchableOpacity
            className="mt-12 h-[62px] w-full items-center justify-center rounded-[10px] bg-primary"
            onPress={handleSignUp}
          >
            <Text className="heading-2 text-white">완료</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Profile;
