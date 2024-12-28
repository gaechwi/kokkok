import type { ImageItem } from "@/components/modals/ListModals";
import type { FlatList } from "react-native-gesture-handler";
import type { RelationType } from "./Friend.interface";

/* -------------------------------------------------------------------------- */
/*                             Delete Modal Props                             */
/* -------------------------------------------------------------------------- */

/**
 * @description
 * 게시물 삭제 모달
 */
export interface DeletePostModalProps {
  type: "DELETE_POST";
  postId: number;
}

/**
 * @description
 * 댓글 삭제 모달
 */
export interface DeleteCommentModalProps {
  type: "DELETE_COMMENT";
  postId: number;
  commentId: number;
}

/* -------------------------------------------------------------------------- */
/*                              List Modal Props                              */
/* -------------------------------------------------------------------------- */

/**
 * @description
 * 게시물 수정/삭제 선택 모달
 */
export interface SelectPostEditDeleteModalProps {
  type: "SELECT_POST_EDIT_DELETE";
  postId: number;
}

/**
 * @description
 * 댓글 삭제 선택 모달
 */
export interface SelectCommentDeleteModalProps {
  type: "SELECT_COMMENT_DELETE";
  postId: number;
  commentId: number;
}

/**
 * @description
 * 프로필 이미지 편집 선택 모달
 */
export interface SelectProfileImageEditModalProps {
  type: "SELECT_PROFILE_IMAGE_EDIT";
  setProfileInput: React.Dispatch<
    React.SetStateAction<{
      avatarUrl: string;
      username: string;
      description: string;
    }>
  >;
}

/**
 * @description
 * 프로필 편집 페이지 이동 모달
 */
export interface SelectProfileEditModalProps {
  type: "SELECT_PROFILE_EDIT";
}

/**
 * @description
 * 게시물 업로드 시 이미지 선택 모달
 */
export interface SelectPostUploadImageModalProps {
  type: "SELECT_POST_UPLOAD_IMAGE";
  imageItems: ImageItem[];
  setImageItems: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  flatListRef: React.RefObject<FlatList<ImageItem>>;
  isLoading: boolean;
}

/**
 * @description
 * 친구 요청/취소/수락 선택 모달
 */
export interface SelectFriendRequestModalProps {
  type: "SELECT_FRIEND_REQUEST";
  userId: string;
  relation: RelationType;
}

/* -------------------------------------------------------------------------- */
/*                           One Button Modal Props                           */
/* -------------------------------------------------------------------------- */

/**
 * @description
 * 이메일 인증 안내 모달
 */
export interface EmailCheckModalProps {
  type: "EMAIL_CHECK";
}

/**
 * @description
 * 게시물 업로드 실패 안내 모달
 */
export interface PostUploadFailModalProps {
  type: "POST_UPLOAD_FAIL";
}

/* -------------------------------------------------------------------------- */
/*                           Two Button Modal Props                           */
/* -------------------------------------------------------------------------- */

/**
 * @description
 * 게시물을 찾을 수 없을 때 안내 모달
 */
export interface PostNotFoundModalProps {
  type: "POST_NOT_FOUND";
}

/**
 * @description
 * 계정 탈퇴 재확인 모달
 */
export interface AccountDeleteModalProps {
  type: "ACCOUNT_DELETE";
}

/**
 * @description
 * 로그아웃(로그인 해제) 재확인 모달
 */
export interface SignOutModalProps {
  type: "SIGN_OUT";
}

/* -------------------------------------------------------------------------- */
/*                           Custom Modal Props                               */
/* -------------------------------------------------------------------------- */

/**
 * @description
 * 쉬는 날 설정 모달
 */
export interface RestDayModalProps {
  type: "REST_DAY";
}

/* -------------------------------------------------------------------------- */
/*                               Modal Types                                  */
/* -------------------------------------------------------------------------- */

/**
 * @description
 * 모든 모달 타입을 합쳐놓은 유니온 타입
 */
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

/* -------------------------------------------------------------------------- */
/*                            Modal State & Etc                               */
/* -------------------------------------------------------------------------- */

/**
 * @description
 * 모달이 표시될 위치
 */
export type ModalPosition = "center" | "bottom";

/**
 * @description
 * 모달의 상태를 표현하는 인터페이스
 */
export interface ModalState {
  isOpen: boolean;
  position: ModalPosition;
  modal: ModalType | null;
  previousPosition: ModalPosition | null;
}

/**
 * @description
 * 리스트 모달에서 사용되는 버튼 프로퍼티
 */
export interface ListButton {
  text: string;
  onPress: () => void | Promise<void>;
  className?: string;
}

/**
 * @description
 * 아이콘 이모지 타입
 */
export type EmojiType = "SAD" | "HAPPY";
