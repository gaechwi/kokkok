export const NOTIFICATION_TYPE = {
  POKE: "poke",
  COMMENT: "comment",
  COMMENT_LIKE: "commentLike",
  LIKE: "like",
} as const;
export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export interface Notification {
  from: string;
  to: string;
  type: NotificationType;
  // data: comment, commentLike, like 필수
  data?: {
    postId: number;
    // commentInfo: comment, commentLike 필수
    commentInfo?: {
      id: number;
      // content: comment 필수
      content?: string;
    };
  };
}

export interface NotificationResponse {
  id: string;
  from: {
    username: string;
    avatarUrl: string;
  };
  type: NotificationType;
  data?: {
    postId: string;
    commentInfo?: {
      id: string;
      content?: string;
    };
  };
  createdAt: string;
}
