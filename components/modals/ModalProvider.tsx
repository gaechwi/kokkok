import Icons from "@/constants/icons";
import { useModal } from "@/hooks/useModal";
import type { ListButton, ModalPosition } from "@/types/Modal.interface";
import { modalStateAtom } from "@/utils/modal.atom";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { Animated, Easing, Modal, Text, TouchableOpacity } from "react-native";
import { View } from "react-native";
import RestDayModal from "../RestDayModal";
import { DeleteCommentModal, DeletePostModal } from "./DeleteModals";
import {
  SelectCommentDeleteModal,
  SelectFriendRequestModal,
  SelectPostEditDeleteModal,
  SelectPostUploadImageModal,
  SelectProfileEditModal,
  SelectProfileImageEditModal,
} from "./ListModals";
import { EmailCheckModal, PostUploadFailModal } from "./OneButtonModals";
import {
  AccountDeleteModal,
  PostNotFoundModal,
  SignOutModal,
} from "./TwoButtonModals";

type EmojiType = "SAD" | "HAPPY";

const Emojis = {
  SAD: <Icons.FaceNotDoneIcon width={40} height={40} />,
  HAPPY: <Icons.FaceDoneIcon width={40} height={40} />,
};

export default function ModalContainer() {
  const [modalState] = useAtom(modalStateAtom);
  const { closeModal } = useModal();
  const { isOpen, modal, position, previousPosition } = modalState;

  const opacityAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      opacityAnim.setValue(1);
      if (!previousPosition) {
        translateYAnim.setValue(0);
        Animated.timing(translateYAnim, {
          toValue: 1,
          useNativeDriver: true,
          duration: 600,
          easing: Easing.bezier(0.6, 1, 0.4, 1),
        }).start();
      } else {
        if (position === "center" && previousPosition === "bottom") {
          translateYAnim.setValue(0);
          Animated.timing(translateYAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.bezier(0.6, 1, 0.4, 1),
            useNativeDriver: true,
          }).start();
        } else {
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            useNativeDriver: true,
          }).start(() => {
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 300,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              useNativeDriver: true,
            }).start();
          });
        }
      }
    } else {
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.bezier(0.6, 1, 0.4, 1),
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, position, previousPosition, opacityAnim, translateYAnim]);

  if (!modal) return null;

  const renderContent = () => {
    switch (modal.type) {
      // Delete Modals
      case "DELETE_POST":
        return <DeletePostModal postId={modal.postId} />;
      case "DELETE_COMMENT":
        return (
          <DeleteCommentModal
            postId={modal.postId}
            commentId={modal.commentId}
          />
        );
      // List Modals
      case "SELECT_POST_EDIT_DELETE":
        return (
          <SelectPostEditDeleteModal
            position={position}
            postId={modal.postId}
          />
        );
      case "SELECT_COMMENT_DELETE":
        return (
          <SelectCommentDeleteModal
            position={position}
            postId={modal.postId}
            commentId={modal.commentId}
          />
        );
      case "SELECT_PROFILE_IMAGE_EDIT":
        return (
          <SelectProfileImageEditModal
            setProfileInput={modal.setProfileInput}
          />
        );
      case "SELECT_PROFILE_EDIT":
        return <SelectProfileEditModal />;
      case "SELECT_POST_UPLOAD_IMAGE":
        return (
          <SelectPostUploadImageModal
            imageItems={modal.imageItems}
            setImageItems={modal.setImageItems}
            flatListRef={modal.flatListRef}
            isLoading={modal.isLoading}
          />
        );
      case "SELECT_FRIEND_REQUEST":
        return (
          <SelectFriendRequestModal
            userId={modal.userId}
            relation={modal.relation}
          />
        );
      // One Button Modals
      case "EMAIL_CHECK":
        return <EmailCheckModal />;
      case "POST_UPLOAD_FAIL":
        return <PostUploadFailModal />;
      // Two Button Modals
      case "POST_NOT_FOUND":
        return <PostNotFoundModal />;
      case "ACCOUNT_DELETE":
        return <AccountDeleteModal />;
      case "SIGN_OUT":
        return <SignOutModal />;
      // Custom Modals
      case "REST_DAY":
        return <RestDayModal />;
      default:
        return null;
    }
  };

  return (
    <>
      {isOpen && (
        <View className="-translate-y-1/2 -translate-x-1/2 absolute top-1/2 left-1/2 flex-1">
          <Modal
            transparent
            visible={isOpen}
            animationType="fade"
            onRequestClose={closeModal}
          >
            <View
              className={`size-full flex-1 bg-black/50 ${
                position === "center" ? "justify-center" : "justify-end"
              }`}
              onTouchStart={closeModal}
            >
              <Animated.View
                onTouchStart={(e) => e.stopPropagation()}
                style={{
                  opacity: opacityAnim,
                  transform: [
                    {
                      translateY: translateYAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [500, 0],
                      }),
                    },
                  ],
                }}
              >
                {renderContent()}
              </Animated.View>
            </View>
          </Modal>
        </View>
      )}
    </>
  );
}

// =============================================
//
//                Custom Modals
//
// =============================================

export function DeleteModal({
  onClose,
  onDelete,
}: { onClose: () => void; onDelete: () => void }) {
  return (
    <View className="px-7">
      <View className="items-center rounded-xl bg-white p-6 ">
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
    </View>
  );
}

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
        className="items-center rounded-xl bg-white px-7 py-6"
        onTouchStart={(e) => e.stopPropagation()}
      >
        {!!emoji && Emojis[emoji]}

        <Text className="title-3 mt-4 text-center text-gray-90">
          {contents}
        </Text>

        <TouchableOpacity
          onPress={onPress}
          className="mt-5 h-[52px] w-full grow flex-row items-center justify-center rounded-[8px] bg-primary"
        >
          <Text className="text-center font-pbold text-[17px] text-white leading-[150%]">
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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

export function ListModal({
  position,
  buttons,
}: {
  position: ModalPosition;
  buttons: ListButton[];
}) {
  return (
    <View className={position === "center" ? "px-[46px]" : ""}>
      <View
        className={`items-center bg-white ${position === "center" ? "rounded-xl" : "rounded-t-xl"}`}
      >
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={button.text}
            className={`h-[82px] w-full items-center justify-center ${
              index !== buttons.length - 1 ? "border-gray-20 border-b" : ""
            } ${button.className || ""}`}
            onPress={async () => {
              await button.onPress();
            }}
          >
            <Text className="title-2 text-gray-90">{button.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
