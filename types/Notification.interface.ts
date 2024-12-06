export const NOTIFICATION_TYPE = {
  POKE: "poke",
  COMMENT: "comment",
  LIKE: "like",
} as const;
export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export interface Notification {
  from: string;
  to: string;
  type: NotificationType;
  // comment, like 필수
  data?: {
    postId: number;
    // comment 필수
    commentInfo?: {
      id: number;
      content: string;
    };
  };
}
