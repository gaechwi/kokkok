import { useModal } from "@/hooks/useModal";
import { deleteUser, supabase, updatePushSetting } from "@/utils/supabase";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { showToast } from "../ToastConfig";
import { TwoButtonModal } from "./ModalProvider";

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
