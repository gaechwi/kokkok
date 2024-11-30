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
import { useRouter } from "expo-router";

import images from "@constants/images";
import { useAtom } from "jotai";
import { signUpFormAtom } from "@contexts/auth";
import { useState } from "react";

const Step1 = () => {
  const [signUpForm, setSignUpForm] = useAtom(signUpFormAtom);
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const router = useRouter();

  const handleContinue = () => {
    if (!signUpForm.email || !signUpForm.password || !passwordConfirm) {
      Alert.alert("빈칸을 채워주세요.");
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

    router.push("/sign-up/step2");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="h-full flex-1 bg-white"
    >
      <ScrollView>
        <View className="mt-10 flex items-center justify-center px-6">
          <Image
            source={images.AuthLogo}
            className="h-[90px] w-[328px]"
            resizeMode="contain"
          />

          <View className="mt-10 flex w-full gap-8">
            <TextInput
              className="h-[58px] w-full rounded-[10px] border border-gray-20 px-4 focus:border-primary"
              placeholder="이메일을 입력해주세요."
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
              className="h-[58px] w-full rounded-[10px] border border-gray-20 px-4 focus:border-primary"
              placeholder="비밀번호를 입력해주세요."
              secureTextEntry
              accessibilityLabel="비밀번호 입력"
              accessibilityHint="비밀번호를 입력해주세요."
              value={signUpForm.password}
              onChangeText={(text) =>
                setSignUpForm({ ...signUpForm, password: text })
              }
            />

            <TextInput
              className="h-[58px] w-full rounded-[10px] border border-gray-20 px-4 focus:border-primary"
              placeholder="비밀번호를 한번 더 입력해주세요"
              secureTextEntry
              accessibilityLabel="비밀번호 재입력"
              accessibilityHint="비밀번호를 한번 더 입력해주세요"
              value={passwordConfirm}
              onChangeText={(text) => setPasswordConfirm(text)}
            />
          </View>

          <TouchableOpacity
            className="mt-10 h-[62px] w-full items-center justify-center rounded-[10px] bg-primary"
            onPress={handleContinue}
          >
            <Text className="heading-2 text-white">계속하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Step1;
