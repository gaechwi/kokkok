import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { deleteUser, getCurrentUser, supabase } from "@/utils/supabase";
import useFetchData from "@/hooks/useFetchData";
import AlertToggle from "@/components/AlertToggle";
import { useAtom } from "jotai";
import { alertToggleAtom } from "@/contexts/alert";

export default function Setting() {
  const router = useRouter();
  const [toggleValue, setToggleValue] = useAtom(alertToggleAtom);

  const { data: currentUser } = useFetchData(
    ["currentUser"],
    getCurrentUser,
    "현재 사용자를 불러올 수 없습니다.",
  );

  return (
    <View className="flex-1 bg-white">
      <View className="border-gray-5 border-b-8 px-6 py-[22px]">
        <View className="flex-row items-center justify-between">
          <Text className="heading-2 text-gray-80">알림 설정</Text>
          <AlertToggle useAllAlert />
        </View>
        <View className="mt-5 gap-5 px-2">
          <View className="flex-row items-center justify-between">
            <Text className="font-pmedium text-gray-80 text-xl">
              좋아요 알림
            </Text>
            <AlertToggle
              toggleValue={toggleValue.like}
              setToggleValue={(value) =>
                setToggleValue((prev) => ({ ...prev, like: value }))
              }
            />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="font-pmedium text-gray-80 text-xl">댓글 알림</Text>
            <AlertToggle
              toggleValue={toggleValue.comment}
              setToggleValue={(value) =>
                setToggleValue((prev) => ({ ...prev, comment: value }))
              }
            />
          </View>
        </View>
      </View>
      <View className="border-gray-5 border-b-8 px-6 py-[22px]">
        <Text className="heading-2 text-gray-80">계정 설정</Text>
        <View className="mt-5 gap-5 px-2">
          <TouchableOpacity
            className="flex-row items-center justify-between"
            onPress={() => router.push("/password-reset/step1")}
          >
            <Text className="font-pmedium text-gray-80 text-xl">
              비밀번호 변경
            </Text>
            <Icons.ChevronRightIcon color={colors.gray[70]} />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-between"
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace("/sign-in");
            }}
          >
            <Text className="font-pmedium text-gray-80 text-xl">로그아웃</Text>
            <Icons.ChevronRightIcon color={colors.gray[70]} />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-between"
            onPress={async () => {
              await deleteUser(currentUser?.id ?? "");

              router.replace("/sign-in");
            }}
          >
            <Text className="font-pmedium text-gray-80 text-xl">계정 탈퇴</Text>
            <Icons.ChevronRightIcon color={colors.gray[70]} />
          </TouchableOpacity>
        </View>
      </View>
      <View className="border-gray-5 border-b-8 px-6 py-[22px]">
        <Text className="heading-2 text-gray-80">문의하기</Text>
      </View>
      <View className="border-gray-5 border-b-8 px-6 py-[22px]">
        <TouchableOpacity
          onPress={() =>
            Linking.openURL("https://github.com/Epilogue-1/kokkok")
          }
        >
          <Text className="heading-2 text-gray-80">
            우리 앱 깃허브 놀러가기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
