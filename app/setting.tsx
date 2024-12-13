import AlertToggle from "@/components/AlertToggle";
import CustomModal from "@/components/Modal";
import { showToast } from "@/components/ToastConfig";
import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import { alertToggleAtom } from "@/contexts/alert";
import useFetchData from "@/hooks/useFetchData";
import { deleteUser, getCurrentUser, supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import { useState } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

export default function Setting() {
  const router = useRouter();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);

  const [toggleValue, setToggleValue] = useAtom(alertToggleAtom);
  const [isLoading, setIsLoading] = useState(false);

  const { data: currentUser } = useFetchData(
    ["currentUser"],
    getCurrentUser,
    "현재 사용자를 불러올 수 없습니다.",
  );

  return (
    <>
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
              <Text className="font-pmedium text-gray-80 text-xl">
                댓글 알림
              </Text>
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
              onPress={() => setIsSignOutModalVisible(true)}
            >
              <Text className="font-pmedium text-gray-80 text-xl">
                로그아웃
              </Text>
              <Icons.ChevronRightIcon color={colors.gray[70]} />
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => setIsDeleteModalVisible(true)}
            >
              <Text className="font-pmedium text-gray-80 text-xl">
                계정 탈퇴
              </Text>
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
      <CustomModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        position="middle"
      >
        <View className="w-full items-center p-[24px]">
          <Icons.FaceNotDoneIcon width={40} height={40} />
          <Text className="title-3 mt-4 text-center">
            탈퇴하면 되돌릴 수 없어요{"\n"}
            그래도 탈퇴하시겠어요?
          </Text>
          <View className="mt-5 flex-row justify-between gap-5">
            <TouchableOpacity
              className="h-[52px] w-[127px] items-center justify-center rounded-[10px] bg-gray-40"
              onPress={() => {
                setIsDeleteModalVisible(false);
              }}
              disabled={isLoading}
            >
              <Text className="title-2 text-white">취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="h-[52px] w-[127px] items-center justify-center rounded-[10px] bg-primary"
              onPress={async () => {
                try {
                  setIsLoading(true);

                  await deleteUser(currentUser?.id ?? "");

                  router.replace("/sign-in");
                  showToast("success", "탈퇴가 완료되었습니다!");
                } catch (error) {
                  showToast("error", "탈퇴에 실패했습니다.");
                } finally {
                  setIsDeleteModalVisible(false);
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            >
              <Text className="title-2 text-white">탈퇴</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>
      <CustomModal
        visible={isSignOutModalVisible}
        onClose={() => setIsSignOutModalVisible(false)}
        position="middle"
      >
        <View className="h-[180px] w-full items-center p-[24px]">
          <Text className="title-3 text-center">
            이 계정에서{"\n"}
            로그아웃 하시겠어요?
          </Text>
          <View className="mt-[28px] flex-row justify-between gap-5">
            <TouchableOpacity
              className="h-[52px] w-[127px] items-center justify-center rounded-[10px] bg-gray-40"
              onPress={() => {
                setIsSignOutModalVisible(false);
              }}
              disabled={isLoading}
            >
              <Text className="title-2 text-white">취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="h-[52px] w-[127px] items-center justify-center rounded-[10px] bg-primary"
              onPress={async () => {
                setIsLoading(true);

                await supabase.auth.signOut();

                setIsSignOutModalVisible(false);
                setIsLoading(false);

                router.replace("/sign-in");

                showToast("success", "로그아웃이 완료되었습니다!");
              }}
              disabled={isLoading}
            >
              <Text className="title-2 text-white">로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>
    </>
  );
}
