import Icons from "@/constants/icons";
import { useModal } from "@/hooks/useModal";
import type { EmojiType } from "@/types/Modal.interface";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";

const Emojis = {
  SAD: <Icons.FaceNotDoneIcon width={40} height={40} />,
  HAPPY: <Icons.FaceDoneIcon width={40} height={40} />,
};

export function OneButtonModal({
  onClose,
  emoji,
  contents,
  buttonText,
  onPress,
}: {
  onClose: () => void;
  emoji?: EmojiType;
  contents: string;
  buttonText: string;
  onPress: () => void;
}) {
  return (
    <View
      className="h-full items-center justify-center px-7"
      onTouchStart={onClose}
    >
      <View
        className="w-full items-center rounded-xl bg-white px-[55px] py-6"
        onTouchStart={(e) => e.stopPropagation()}
      >
        {!!emoji && Emojis[emoji]}

        <Text className="title-3 mt-4 text-center text-gray-90">
          {contents}
        </Text>

        <TouchableOpacity
          onPress={onPress}
          className="mt-5 h-[52px] w-full flex-row items-center justify-center rounded-[8px] bg-primary"
        >
          <Text className="text-center font-pbold text-[17px] text-white leading-[150%]">
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
