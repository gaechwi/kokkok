import {
  NOTIFICATION_TYPE,
  type NotificationType,
} from "@/types/Notification.interface";

const COMMENT_MAX_LENGTH = 18;
const shorten_comment = (comment: string) =>
  `"${comment.length > COMMENT_MAX_LENGTH ? comment.slice(0, COMMENT_MAX_LENGTH).concat("...") : comment}"`;

export function formMessage(
  type: NotificationType,
  username?: string,
  comment?: string,
) {
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
  };

  return NOTIFICATION_CONFIG[type];
}
