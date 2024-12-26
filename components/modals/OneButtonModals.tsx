import { useModal } from "@/hooks/useModal";
import { useRouter } from "expo-router";
import { OneButtonModal } from "./ModalProvider";

export function EmailCheckModal() {
  const { closeModal } = useModal();
  const router = useRouter();

  return (
    <OneButtonModal
      onClose={() => {
        closeModal();
        router.push("/sign-up/step2");
      }}
      emoji="HAPPY"
      contents={"이메일로 전송된\n인증 코드를 확인해주세요!"}
      buttonText="확인"
      onPress={() => {
        closeModal();
        router.push("/sign-up/step2");
      }}
    />
  );
}

export function PostUploadFailModal() {
  const { closeModal } = useModal();

  return (
    <OneButtonModal
      buttonText="확인"
      contents={"업로드에 실패했습니다 \n다시한번 시도해주세요"}
      onClose={closeModal}
      onPress={closeModal}
      emoji="SAD"
      key="upload-info-modal"
    />
  );
}
