import CustomSwitch from "@/components/CustomSwitch";
import LoadingScreen from "@/components/LoadingScreen";
import { OneButtonModal, TwoButtonModal } from "@/components/Modal";
import { showToast } from "@/components/ToastConfig";
import colors from "@/constants/colors";
import Icons from "@/constants/icons";
import useFetchData from "@/hooks/useFetchData";
import {
  NOTIFICATION_TYPE,
  type NotificationType,
  type PushSetting,
} from "@/types/Notification.interface";
import { isTokenValid } from "@/utils/pushTokenManager";
import {
  deleteUser,
  getCurrentSession,
  getPushSetting,
  supabase,
  updatePushSetting,
} from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Platform, Text, TouchableOpacity, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const NOTIFICATION_TYPE_GROUPS: { [key: string]: NotificationType[] } = {
  like: ["like", "commentLike"],
  comment: ["comment"],
  mention: ["mention"],
  poke: ["poke"],
  friend: ["friend"],
} as const;

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
  const { data: pushSetting, isPending: isTokenPending } =
    useFetchData<PushSetting | null>(
      ["pushToken", session?.user.id],
      () => getPushSetting(session?.user.id || ""),
      "푸시 알림 설정 정보 로드에 실패했습니다.",
      !!session,
    );

  // 계정 탈퇴 핸들러
  const handleDeleteAccount = async () => {
    setIsLoading(true);

    try {
      await deleteUser(session?.user.id ?? "");
      showToast("success", "탈퇴가 완료되었습니다!");
    } catch (error) {
      showToast("error", "탈퇴에 실패했습니다.");
    }

    setIsDeleteModalVisible(false);
    setIsLoading(false);
  };

  // 로그아웃 핸들러
  const handleSignOut = async () => {
    if (session) {
      setIsLoading(true);

      await updatePushSetting({
        userId: session.user.id,
        token: null,
      });
      await supabase.auth.signOut();

      setIsLoading(false);
    }

    setIsSignOutModalVisible(false);
    showToast("success", "로그아웃이 완료되었습니다!");
  };

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <View className="gap-2 bg-gray-5 pb-2">
        {/* 알림 설정 */}
        {!session || isTokenPending ? (
          <View className="h-[324px] items-center justify-center">
            <LoadingScreen />
          </View>
        ) : (
          <NotificationSetting userId={session.user.id} setting={pushSetting} />
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
        <TwoButtonModal
          isVisible={isDeleteModalVisible}
          onClose={() => setIsDeleteModalVisible(false)}
          emoji="sad"
          contents={"탈퇴하면 되돌릴 수 없어요\n그래도 탈퇴하시겠어요?"}
          leftButtonText="취소"
          rightButtonText="탈퇴"
          onLeftButtonPress={() => setIsDeleteModalVisible(false)}
          onRightButtonPress={handleDeleteAccount}
          isLoading={isLoading}
          variant="danger"
        />
      </View>

      <View className="flex-1">
        <TwoButtonModal
          isVisible={isSignOutModalVisible}
          onClose={() => setIsSignOutModalVisible(false)}
          contents={"이 계정에서\n로그아웃 하시겠어요?"}
          leftButtonText="취소"
          rightButtonText="로그아웃"
          onLeftButtonPress={() => setIsSignOutModalVisible(false)}
          onRightButtonPress={handleSignOut}
          isLoading={isLoading}
          variant="danger"
        />
      </View>
    </SafeAreaView>
  );
}

function NotificationSetting({
  userId,
  setting,
}: { userId: string; setting?: PushSetting | null }) {
  const queryClient = useQueryClient();
  const [isSettingModalVisible, setIsSettingModalVisible] = useState(false);

  const granted = setting?.grantedNotifications || [];
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
      title: "멘션 알림",
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

  const openSetting = async () => {
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:");
    } else {
      await Linking.openSettings();
    }
  };

  // 기존 토큰이 유효하지 않으면 권한 설정 이동 모달 띄우기
  const checkPermission = () => {
    if (isTokenValid(setting?.token)) return true;
    setIsSettingModalVisible(true);
  };

  // grantedNotification의 변경사항을 서버에 반영
  const updateGrantedNotifications = async (newGranted: NotificationType[]) => {
    try {
      await updatePushSetting({
        userId,
        grantedNotifications: newGranted,
      });
      queryClient.invalidateQueries({ queryKey: ["pushToken"] });
    } catch {
      showToast("fail", "알림 설정 업데이트에 실패했습니다.");
    }
  };

  // 최상단 스위치 클릭 핸들러
  const handleAllSwitchPress = async () => {
    if (!(await checkPermission())) return;

    const prevAllSwitch = allSwitch.value;
    for (const { value, isInit } of Object.values(SWITCH_CONFIG)) {
      // 개별 스위치 업데이트
      value.value = !prevAllSwitch;
      isInit.value = false;
    }
    // 최상단 스위치 업데이트
    allSwitch.value = !prevAllSwitch;
    isAllSwitchInit.value = false;

    // DB에 변경사항 반영
    const newGranted = prevAllSwitch
      ? []
      : [...Object.values(NOTIFICATION_TYPE)];
    updateGrantedNotifications(newGranted);
  };

  // 개별 스위치 클릭 핸들러
  const handleSwitchPress = async (type: SwitchType) => {
    if (!(await checkPermission())) return;

    const prevValue = SWITCH_CONFIG[type].value.value;

    // 최상단 스위치 업데이트
    if (!prevValue) {
      // 하나라도 true면 allSwitch도 true
      allSwitch.value = true;
      isAllSwitchInit.value = false;
    } else if (
      Object.entries(SWITCH_CONFIG).every(
        ([key, { value }]) => key === type || !value.value,
      )
    ) {
      // 나 제외 나머지 것들도 다 false 이면 allSwitch도 false
      allSwitch.value = false;
      isAllSwitchInit.value = false;
    }

    // 개별 스위치 업데이트
    SWITCH_CONFIG[type].value.value = !SWITCH_CONFIG[type].value.value;
    SWITCH_CONFIG[type].isInit.value = false;

    // DB에 변경사항 반영
    const typesToUpdate = NOTIFICATION_TYPE_GROUPS[type];
    const newGranted = prevValue
      ? granted.filter((t) => !typesToUpdate.includes(t))
      : [...granted, ...typesToUpdate];
    updateGrantedNotifications(newGranted);
  };

  return (
    <View className="gap-5 bg-white px-6 py-[22px]">
      <View className="flex-row items-center justify-between ">
        <Text className="heading-2 text-gray-80">알림 설정</Text>
        <CustomSwitch
          value={allSwitch}
          isInit={isAllSwitchInit}
          onPress={handleAllSwitchPress}
        />
      </View>
      {/* 개별 스위치 리스트 */}
      <View className="gap-5 pl-2">
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

      <View className="flex-1">
        <OneButtonModal
          buttonText="설정으로 이동"
          contents={"알림 권한을 허용해주세요"}
          isVisible={isSettingModalVisible}
          onClose={() => setIsSettingModalVisible(false)}
          onPress={openSetting}
          emoji="sad"
          key="upload-info-modal"
        />
      </View>
    </View>
  );
}
