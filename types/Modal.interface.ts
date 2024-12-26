import type { ImageItem } from "@/components/modals/ListModals";
import type { FlatList } from "react-native-gesture-handler";
import type { RelationType } from "./Friend.interface";

// ===============================================================
//
//                        Delete Modal
//
// ===============================================================

type DeletePostModalProps = {
  type: "DELETE_POST";
  postId: number;
};

type DeleteCommentModalProps = {
  type: "DELETE_COMMENT";
  postId: number;
  commentId: number;
};

// ===============================================================
//
//                        List Modal
//
// ===============================================================

type SelectPostEditDeleteModalProps = {
  type: "SELECT_POST_EDIT_DELETE";
  postId: number;
};

type SelectCommentDeleteModalProps = {
  type: "SELECT_COMMENT_DELETE";
  postId: number;
  commentId: number;
};

type SelectProfileImageEditModalProps = {
  type: "SELECT_PROFILE_IMAGE_EDIT";
  setProfileInput: React.Dispatch<
    React.SetStateAction<{
      avatarUrl: string;
      username: string;
      description: string;
    }>
  >;
};

type SelectProfileEditModalProps = {
  type: "SELECT_PROFILE_EDIT";
};

type SelectPostUploadImageModalProps = {
  type: "SELECT_POST_UPLOAD_IMAGE";
  imageItems: ImageItem[];
  setImageItems: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  flatListRef: React.RefObject<FlatList<ImageItem>>;
  isLoading: boolean;
};

type SelectFriendRequestModalProps = {
  type: "SELECT_FRIEND_REQUEST";
  userId: string;
  relation: RelationType;
};

// ===============================================================
//
//                        One Button Modal
//
// ===============================================================

type EmailCheckModalProps = {
  type: "EMAIL_CHECK";
};

type PostUploadFailModalProps = {
  type: "POST_UPLOAD_FAIL";
};

// ===============================================================
//
//                        Two Button Modal
//
// ===============================================================

type PostNotFoundModalProps = {
  type: "POST_NOT_FOUND";
};

type AccountDeleteModalProps = {
  type: "ACCOUNT_DELETE";
};

type SignOutModalProps = {
  type: "SIGN_OUT";
};

// ===============================================================
//
//                        Custom Modal
//
// ===============================================================

type RestDayModalProps = {
  type: "REST_DAY";
};

// ===============================================================
//
//                        Modal State
//
// ===============================================================

export type ModalType =
  // Delete Modal
  | DeletePostModalProps
  | DeleteCommentModalProps
  // List Modal
  | SelectPostEditDeleteModalProps
  | SelectCommentDeleteModalProps
  | SelectProfileImageEditModalProps
  | SelectProfileEditModalProps
  | SelectPostUploadImageModalProps
  | SelectFriendRequestModalProps
  // One Button
  | EmailCheckModalProps
  | PostUploadFailModalProps
  // Two Button
  | PostNotFoundModalProps
  | AccountDeleteModalProps
  | SignOutModalProps
  // Custom
  | RestDayModalProps;

export type ModalPosition = "center" | "bottom";

export interface ModalState {
  isOpen: boolean;
  position: ModalPosition;
  modal: ModalType | null;
  previousPosition: ModalPosition | null;
}

export interface ListButton {
  text: string;
  onPress: () => void | Promise<void>;
  className?: string;
}

export type EmojiType = "SAD" | "HAPPY";
