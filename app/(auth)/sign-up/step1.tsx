import { OneButtonModal } from "@/components/Modal";
import { sendUpOTP, supabase } from "@/utils/supabase";
import images from "@constants/images";
import { signUpFormAtom } from "@contexts/auth";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import { useState } from "react";
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

const Step1 = () => {
  const [signUpForm, setSignUpForm] = useAtom(signUpFormAtom);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleContinue = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("isOAuth, email")
        .eq("email", signUpForm.email)
        .single();

      if (
        !signUpForm.email ||
        !signUpForm.username ||
        !signUpForm.password ||
        !passwordConfirm
      ) {
        Alert.alert("빈칸을 채워주세요.");
        return;
      }

      if (signUpForm.username.length < 3) {
        Alert.alert("닉네임은 3자 이상이어야 합니다.");
        return;
      }

      if (signUpForm.password !== passwordConfirm) {
        Alert.alert("비밀번호가 일치하지 않습니다.");
        return;
      }

      if (signUpForm.password.length < 8 || passwordConfirm.length < 8) {
        Alert.alert("비밀번호는 8자 이상이어야 합니다.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signUpForm.email)) {
        Alert.alert("알림", "올바른 이메일 형식이 아닙니다.");
        return;
      }

      if (userData?.isOAuth) {
        Alert.alert("알림", "소셜 로그인으로 가입된 계정입니다.");
        return;
      }

      if (userData?.email) {
        Alert.alert("알림", "이미 가입된 이메일입니다.");
        return;
      }

      await sendUpOTP(signUpForm.email);
      setIsModalVisible(true);
    } catch (error) {
      Alert.alert(
        "알림",
        error instanceof Error ? error.message : "이메일 전송에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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

            <View className="mt-10 flex w-full gap-8">
              <TextInput
                className="placeholder:body-1 h-[58px] w-full rounded-[10px] border border-gray-20 px-4 placeholder:text-gray-40 focus:border-primary"
                placeholder="이메일을 입력해주세요"
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="이메일 입력"
                accessibilityHint="이메일을 입력해주세요."
                value={signUpForm.email}
                onChangeText={(text) =>
                  setSignUpForm({ ...signUpForm, email: text })
                }
              />

              <TextInput
                className="placeholder:body-1 h-[58px] w-full rounded-[10px] border border-gray-20 px-4 placeholder:text-gray-40 focus:border-primary"
                placeholder="닉네임을 입력해주세요"
                autoCapitalize="none"
                accessibilityLabel="닉네임 입력"
                accessibilityHint="닉네임을 입력해주세요."
                value={signUpForm.username}
                onChangeText={(text) =>
                  setSignUpForm({ ...signUpForm, username: text })
                }
              />

              <TextInput
                className="placeholder:body-1 h-[58px] w-full rounded-[10px] border border-gray-20 px-4 placeholder:text-gray-40 focus:border-primary"
                placeholder="비밀번호를 입력해주세요"
                autoCapitalize="none"
                secureTextEntry
                accessibilityLabel="비밀번호 입력"
                accessibilityHint="비밀번호를 입력해주세요."
                value={signUpForm.password}
                onChangeText={(text) =>
                  setSignUpForm({ ...signUpForm, password: text })
                }
              />

              <TextInput
                className="placeholder:body-1 h-[58px] w-full rounded-[10px] border border-gray-20 px-4 placeholder:text-gray-40 focus:border-primary"
                placeholder="비밀번호를 한번 더 입력해주세요"
                autoCapitalize="none"
                secureTextEntry
                accessibilityLabel="비밀번호 재입력"
                accessibilityHint="비밀번호를 한번 더 입력해주세요"
                value={passwordConfirm}
                onChangeText={(text) => setPasswordConfirm(text)}
              />
            </View>

            <TouchableOpacity
              className={`mt-10 h-[62px] w-full items-center justify-center rounded-[10px] ${
                isLoading ? "bg-gray-20" : "bg-primary"
              }`}
              onPress={handleContinue}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text className="heading-2 text-white">
                  인증 메일 전송 중...
                </Text>
              ) : (
                <Text className="heading-2 text-white">다음</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <OneButtonModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          router.push("/sign-up/step2");
        }}
        emoji="happy"
        contents={"이메일로 전송된\n인증 코드를 확인해주세요!"}
        buttonText="확인"
        onPress={() => {
          setIsModalVisible(false);
          router.push("/sign-up/step2");
        }}
      />
    </>
  );
};

export default Step1;
