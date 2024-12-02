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
// import { useRouter } from "expo-router";
// import { signUp } from "@/utils/supabase";

const Step2 = () => {
  const [signUpForm, setSignUpForm] = useAtom(signUpFormAtom);
  //   const router = useRouter();

  const handleSignUp = async () => {
    // if (!signUpForm.username) {
    //   Alert.alert("닉네임을 채워주세요");
    //   return;
    // }
    // try {
    //   await signUp({
    //     email: signUpForm.email,
    //     password: signUpForm.password,
    //     username: signUpForm.username,
    //     description: signUpForm.description,
    //   });
    //   router.replace("/home");
    // } catch (error) {
    //   Alert.alert(
    //     "회원가입 실패",
    //     error instanceof Error ? error.message : "회원가입에 실패했습니다.",
    //   );
    // }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="h-full flex-1 bg-white"
    >
      <ScrollView>
        <View className="mt-[58px] flex items-center justify-center px-6">
          <Image
            source={images.AuthLogo}
            className="h-[90px] w-[328px]"
            resizeMode="contain"
          />
          <View className="relative flex w-full gap-10 last:mt-10">
            <TextInput
              className="placeholder:body-1 h-[58px] w-full rounded-[10px] border border-gray-20 px-4 placeholder:text-gray-40 focus:border-primary"
              placeholder="인증코드를 입력해주세요."
              accessibilityLabel="인증코드 입력"
              accessibilityHint="인증코드를 입력해주세요."
              //   value={}
              //   onChangeText={}
            />
            <Text className="-translate-y-1/2 body-1 absolute top-1/2 right-4 text-gray-40">
              nn : nn
            </Text>
          </View>

          <TouchableOpacity
            className="mt-10 h-[62px] w-full items-center justify-center rounded-[10px] bg-primary"
            onPress={handleSignUp}
          >
            <Text className="heading-2 text-white">완료</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Step2;
