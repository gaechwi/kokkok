import CustomSwitch from "@/components/CustomSwitch";
import LoadingScreen from "@/components/LoadingScreen";
import CustomModal from "@/components/Modal";
import { showToast } from "@/components/ToastConfig";
import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import useFetchData from "@/hooks/useFetchData";
import type {
  NotificationType,
  PushToken,
} from "@/types/Notification.interface";
import { isTokenValid } from "@/utils/pushTokenManager";
import {
  deleteUser,
  getCurrentSession,
  getPushToken,
  supabase,
  updatePushToken,
} from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Setting() {
  const router = useRouter();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // 로그인한 유저 정보 조회
  const { data: session } = useFetchData<Session>(
    ["session"],
    getCurrentSession,
    "로그인 정보 조회에 실패했습니다.",
  );

  // 푸시알림 설정 정보 조회
  const { data: token, isPending: isTokenPending } =
    useFetchData<PushToken | null>(
      ["pushTokenData"],
      () => getPushToken(session?.user.id || ""),
      "푸시 알림 설정 정보 로드에 실패했습니다.",
      !!session,
    );

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <View className="gap-2 bg-gray-5 pb-2">
        {/* 알림 설정 */}
        {!session || isTokenPending ? (
          <View className="h-[324px] items-center justify-center">
            <LoadingScreen />
          </View>
        ) : (
          <NotificationSetting userId={session.user.id} token={token} />
        )}

        {/* 계정 설정 */}
        <View className="bg-white px-6 py-[22px]">
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

        {/* 문의하기 */}
        <View className="bg-white px-6 py-[22px]">
          <Text className="heading-2 text-gray-80">문의하기</Text>
        </View>

        {/* 깃허브 놀러가기 */}
        <View className="bg-white px-6 py-[22px]">
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

      <View className="flex-1">
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
                  setIsLoading(true);

                  try {
                    await deleteUser(session?.user.id ?? "");

                    router.replace("/sign-in");
                    showToast("success", "탈퇴가 완료되었습니다!");
                  } catch (error) {
                    showToast("error", "탈퇴에 실패했습니다.");
                  }

                  setIsDeleteModalVisible(false);
                  setIsLoading(false);
                }}
                disabled={isLoading}
              >
                <Text className="title-2 text-white">탈퇴</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CustomModal>
      </View>

      <View className="flex-1 ">
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
                  if (session) {
                    setIsLoading(true);

                    await updatePushToken({
                      userId: session.user.id,
                      pushToken: null,
                    });
                    await supabase.auth.signOut();

                    setIsLoading(false);
                  }
                  setIsSignOutModalVisible(false);
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
      </View>
    </SafeAreaView>
  );
}

function NotificationSetting({
  userId,
  token,
}: { userId: string; token?: PushToken | null }) {
  const queryClient = useQueryClient();

  const granted = token?.grantedNotifications || [];
  const allSwitch = useSharedValue(!!granted.length);
  const isAllSwitchInit = useSharedValue(true);
  const SWITCH_CONFIG = {
    like: {
      title: "좋아요 알림",
      value: useSharedValue(granted.includes("like")),
      isInit: useSharedValue(true),
    },
    comment: {
      title: "댓글 알림",
      value: useSharedValue(granted.includes("comment")),
      isInit: useSharedValue(true),
    },
    mention: {
      title: "언급 알림",
      value: useSharedValue(granted.includes("mention")),
      isInit: useSharedValue(true),
    },
    poke: {
      title: "콕찌르기 알림",
      value: useSharedValue(granted.includes("poke")),
      isInit: useSharedValue(true),
    },
    friend: {
      title: "친구요청 알림",
      value: useSharedValue(granted.includes("friend")),
      isInit: useSharedValue(true),
    },
  } as const;
  type SwitchType = keyof typeof SWITCH_CONFIG;

  // 최상단 스위치 클릭 핸들러
  const handleAllSwitchPress = () => {
    for (const { value, isInit } of Object.values(SWITCH_CONFIG)) {
      value.value = !allSwitch.value;
      isInit.value = false;
    }
    allSwitch.value = !allSwitch.value;
    isAllSwitchInit.value = false;
  };

  // 개별 스위치 클릭 핸들러
  const handleSwitchPress = (type: SwitchType) => {
    if (!SWITCH_CONFIG[type].value.value) {
      // 이전값이 false -> 이제 true: 하나라도 true면 allSwitch는 true
      if (!allSwitch.value) {
        allSwitch.value = true;
        isAllSwitchInit.value = false;
        // 기존에 푸시 알람 권한 허용이 제대로 되지 않았던 경우
        if (isTokenValid(token?.pushToken)) {
        }
      }
    } else if (
      // 이전값이 true -> 이제 false: 나 제외 나머지 것들도 다 false 이면 allSwitch도 false
      Object.entries(SWITCH_CONFIG).every(
        ([key, { value }]) => key === type || !value.value,
      ) &&
      allSwitch.value
    ) {
      allSwitch.value = false;
      isAllSwitchInit.value = false;
    }

    SWITCH_CONFIG[type].value.value = !SWITCH_CONFIG[type].value.value;
    SWITCH_CONFIG[type].isInit.value = false;
  };

  // 알림 설정 변경이 있다면 사항 업데이트
  const updateGrantedNotifications = useCallback(async () => {
    const newGranted = Object.entries(SWITCH_CONFIG)
      .filter(([, { value }]) => value.value)
      .map(([key]) => key as NotificationType);

    if (JSON.stringify(granted.sort()) !== JSON.stringify(newGranted.sort())) {
      await updatePushToken({ userId, grantedNotifications: newGranted });
      queryClient.refetchQueries({ queryKey: ["pushTokenData"] });
    }
  }, [queryClient, SWITCH_CONFIG, userId, granted]);

  // 설정화면에서 떠날 때 알림 설정 변경사항 저장
  useFocusEffect(() => {
    return () => {
      updateGrantedNotifications();
    };
  });

  return (
    <View className="bg-white px-6 py-[22px] gap-5">
      <View className="flex-row items-center justify-between ">
        <Text className="heading-2 text-gray-80">알림 설정</Text>
        <CustomSwitch
          value={allSwitch}
          isInit={isAllSwitchInit}
          onPress={handleAllSwitchPress}
        />
      </View>
      {/* 개별 스위치 리스트 */}
      <View className="gap-5 px-2">
        {Object.keys(SWITCH_CONFIG).map((type) => (
          <View key={type} className="flex-row items-center justify-between">
            <Text className="font-pmedium text-gray-80 text-xl">
              {SWITCH_CONFIG[type as SwitchType].title}
            </Text>
            <CustomSwitch
              value={SWITCH_CONFIG[type as SwitchType].value}
              isInit={SWITCH_CONFIG[type as SwitchType].isInit}
              onPress={() => handleSwitchPress(type as SwitchType)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
