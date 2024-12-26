import Icons from "@/constants/icons";
import { useModal } from "@/hooks/useModal";
import type { EmojiType } from "@/types/Modal.interface";
import { deleteUser, supabase, updatePushSetting } from "@/utils/supabase";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import { showToast } from "../ToastConfig";

const Emojis = {
  SAD: <Icons.FaceNotDoneIcon width={40} height={40} />,
  HAPPY: <Icons.FaceDoneIcon width={40} height={40} />,
};

export function TwoButtonModal({
  onClose,
  emoji,
  contents,
  leftButtonText,
  rightButtonText,
  onLeftButtonPress,
  onRightButtonPress,
  isLoading,
  variant = "default",
}: {
  onClose: () => void;
  emoji?: EmojiType;
  contents: string;
  leftButtonText: string;
  rightButtonText: string;
  onLeftButtonPress: () => void;
  onRightButtonPress: () => void;
  isLoading?: boolean;
  variant?: "default" | "danger";
}) {
  const leftButtonStyle =
    variant === "danger"
      ? "h-full flex-1 items-center justify-center rounded-[8px] bg-gray-40"
      : "h-full flex-1 items-center justify-center rounded-[8px] border-2 border-primary bg-white";

  const leftButtonTextStyle =
    variant === "danger"
      ? "font-pbold text-[17px] text-white leading-[150%]"
      : "font-pbold text-[17px] text-primary leading-[150%]";

  return (
    <View
      className="h-full items-center justify-center px-7"
      onTouchStart={onClose}
    >
      <View
        className="items-center rounded-xl bg-white px-7 py-6 "
        onTouchStart={(e) => e.stopPropagation()}
      >
        {!!emoji && Emojis[emoji]}

        <Text className="title-3 mt-4 text-center text-gray-90">
          {contents}
        </Text>

        <View className="mt-5 h-[52px] w-full flex-row items-center gap-5">
          <TouchableOpacity
            onPress={onLeftButtonPress}
            className={leftButtonStyle}
            disabled={isLoading}
          >
            <Text className={leftButtonTextStyle}>{leftButtonText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onRightButtonPress}
            className="h-full flex-1 items-center justify-center rounded-[8px] bg-primary"
            disabled={isLoading}
          >
            <Text className="font-pbold text-[17px] text-white leading-[150%]">
              {rightButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function PostNotFoundModal() {
  const { closeModal } = useModal();
  const router = useRouter();

  return (
    <TwoButtonModal
      onClose={() => {
        closeModal();
        router.back();
      }}
      emoji="SAD"
      contents={"게시글이 삭제되었어요."}
      leftButtonText="뒤로가기"
      rightButtonText="홈으로"
      onLeftButtonPress={() => {
        closeModal();
        router.back();
      }}
      onRightButtonPress={() => {
        closeModal();
        router.replace("/home");
      }}
    />
  );
}

export function AccountDeleteModal() {
  const { closeModal } = useModal();

  const DeleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await supabase.auth.signOut();
    },
    onError: () => {
      showToast("error", "탈퇴 도중 오류가 발생했습니다.");
    },
  });

  // 계정 탈퇴 핸들러
  const handleDeleteAccount = async () => {
    if (DeleteUserMutation.isPending) return;
    DeleteUserMutation.mutate();
  };
  return (
    <TwoButtonModal
      onClose={closeModal}
      emoji="SAD"
      contents={"탈퇴하면 되돌릴 수 없어요\n그래도 탈퇴하시겠어요?"}
      leftButtonText="취소"
      rightButtonText="탈퇴"
      onLeftButtonPress={closeModal}
      onRightButtonPress={handleDeleteAccount}
      isLoading={DeleteUserMutation.isPending}
      variant="danger"
    />
  );
}

export function SignOutModal() {
  const { closeModal } = useModal();

  const SignOutMutation = useMutation({
    mutationFn: async () => {
      await updatePushSetting({ token: "logout" });
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      showToast("success", "로그아웃이 완료되었습니다!");
    },
    onError: () => {
      showToast("error", "로그아웃 도중 오류가 발생했습니다.");
    },
    onSettled: () => {
      closeModal();
    },
  });

  // 로그아웃 핸들러
  const handleSignOut = async () => {
    if (SignOutMutation.isPending) return;
    SignOutMutation.mutate();
  };

  return (
    <TwoButtonModal
      onClose={closeModal}
      contents={"이 계정에서\n로그아웃 하시겠어요?"}
      leftButtonText="취소"
      rightButtonText="로그아웃"
      onLeftButtonPress={closeModal}
      onRightButtonPress={handleSignOut}
      isLoading={SignOutMutation.isPending}
      variant="danger"
    />
  );
}
