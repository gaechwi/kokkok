import { modalStateAtom } from "@/contexts/modal.atom";
import { useModal } from "@/hooks/useModal";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { Animated, Easing, Modal } from "react-native";
import { View } from "react-native";
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
import RestDayModal from "./RestDayModal";
import {
  AccountDeleteModal,
  PostNotFoundModal,
  SignOutModal,
} from "./TwoButtonModals";

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
