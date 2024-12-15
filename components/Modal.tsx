import Icons from "@/constants/icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, Modal, Text, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BottomModalProps {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  position?: "middle" | "bottom";
}

export default function CustomModal({
  children,
  visible,
  onClose,
  position = "bottom",
}: BottomModalProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      duration: 400,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }).start();
  }, [visible, slideAnim]);

  const AnimatedView = Animated.createAnimatedComponent(View);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      className="flex-1"
    >
      <View
        className={`flex-1 bg-black/50 ${
          position === "middle" ? "justify-center px-[46px]" : "justify-end"
        }`}
        onTouchStart={onClose}
      >
        <AnimatedView
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [500, 0],
                }),
              },
            ],
          }}
        >
          <SafeAreaView
            edges={[]}
            className={`z-10 h-fit w-full bg-white ${
              position === "middle" ? "rounded-xl" : "rounded-t-xl"
            }`}
          >
            {children}
          </SafeAreaView>
        </AnimatedView>
      </View>
    </Modal>
  );
}

export function DeleteModal({
  isVisible,
  onClose,
  onDelete,
}: {
  isVisible: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <CustomModal visible={isVisible} onClose={onClose} position="middle">
      <View className="items-center p-6">
        <Icons.TrashCanIcon width={30} height={38} />

        <Text className="title-3 mt-4 text-center text-gray-90">
          삭제하면 되돌릴 수 없어요{"\n"}그래도 삭제하시겠어요?
        </Text>

        <View className="mt-5 h-[52px] flex-row items-center gap-5">
          <TouchableOpacity
            onPress={onClose}
            className="h-full grow items-center justify-center rounded-[8px] bg-gray-40"
          >
            <Text className="title-3 text-white">취소</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            className="h-full grow items-center justify-center rounded-[8px] bg-primary"
          >
            <Text className="title-3 text-white">삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
}

export function OneButtonModal({
  isVisible,
  onClose,
  emoji,
  contents,
  buttonText,
  onPress,
}: {
  isVisible: boolean;
  onClose: () => void;
  emoji?: EmojiType;
  contents: string;
  buttonText: string;
  onPress: () => void;
}) {
  return (
    <CustomModal visible={isVisible} onClose={onClose} position="middle">
      <View className="items-center px-7 py-6">
        {!!emoji && Emojis[emoji]}

        <Text className="title-3 mt-4 text-center text-gray-90">
          {contents}
        </Text>

        <TouchableOpacity
          onPress={() => {
            onPress();
            onClose();
          }}
          className="mt-5 h-[52px] w-full grow flex-row items-center justify-center rounded-[8px] bg-primary"
        >
          <Text className="text-center font-pbold text-[17px] text-white leading-[150%]">
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
}

export function TwoButtonModal({
  isVisible,
  onClose,
  emoji,
  contents,
  leftButtonText,
  rightButtonText,
  onLeftButtonPress,
  onRightButtonPress,
}: {
  isVisible: boolean;
  onClose: () => void;
  emoji?: EmojiType;
  contents: string;
  leftButtonText: string;
  rightButtonText: string;
  onLeftButtonPress: () => void;
  onRightButtonPress: () => void;
}) {
  return (
    <CustomModal visible={isVisible} onClose={onClose} position="middle">
      <View className="items-center px-7 py-6">
        {!!emoji && Emojis[emoji]}

        <Text className="title-3 mt-4 text-center text-gray-90">
          {contents}
        </Text>

        <View className="mt-5 h-[52px] w-full flex-row items-center gap-5">
          <TouchableOpacity
            onPress={() => {
              onLeftButtonPress();
            }}
            className="h-full flex-1 items-center justify-center rounded-[8px] border-2 border-primary bg-white"
          >
            <Text className="font-pbold text-[17px] text-primary leading-[150%]">
              {leftButtonText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onRightButtonPress();
            }}
            className="h-full flex-1 items-center justify-center rounded-[8px] bg-primary"
          >
            <Text className="font-pbold text-[17px] text-white leading-[150%]">
              {rightButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
}

const Emojis = {
  sad: <Icons.FaceNotDoneIcon width={40} height={40} />,
  happy: <Icons.FaceDoneIcon width={40} height={40} />,
};

type EmojiType = "sad" | "happy";
