import {
  NOTIFICATION_TYPE,
  type NotificationType,
} from "@/types/Notification.interface";

const COMMENT_MAX_LENGTH = 18;

export const shorten_comment = (
  comment: string,
  maxLength = COMMENT_MAX_LENGTH,
) =>
  `"${comment.length > maxLength ? comment.slice(0, maxLength).concat("...") : comment}"`;

interface FormMessageProps {
  type: NotificationType;
  username?: string;
  comment?: string;
  isAccepted?: boolean;
}

export function formMessage({
  type,
  username,
  comment,
  isAccepted,
}: FormMessageProps) {
  const NOTIFICATION_CONFIG = {
    [NOTIFICATION_TYPE.POKE]: {
      title: "👈 콕!",
      content: `${username}님이 콕 찌르셨어요.`,
    },
    [NOTIFICATION_TYPE.COMMENT]: {
      title: `${username}님의 댓글`,
      content: shorten_comment(comment || ""),
    },
    [NOTIFICATION_TYPE.MENTION]: {
      title: `${username}님의 멘션`,
      content: shorten_comment(comment || ""),
    },
    [NOTIFICATION_TYPE.COMMENT_LIKE]: {
      title: `${username}님이`,
      content: "댓글에 좋아요를 눌렀어요❤️",
    },
    [NOTIFICATION_TYPE.LIKE]: {
      title: `${username}님이`,
      content: "게시글에 좋아요를 눌렀어요❤️",
    },
    [NOTIFICATION_TYPE.FRIEND]: {
      title: `${username}님이`,
      content: isAccepted
        ? "친구 요청을 수락하셨어요😊"
        : "친구 요청을 보냈어요",
    },
  };

  return NOTIFICATION_CONFIG[type];
}
