import type { UserProfile } from "./User.interface";

export const NOTIFICATION_TYPE = {
  POKE: "poke",
  COMMENT: "comment",
  COMMENT_LIKE: "commentLike",
  LIKE: "like",
  MENTION: "mention",
} as const;
export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export interface NotificationData {
  postId: number;
  // commentInfo: comment, commentLike 필수
  commentInfo?: {
    id: number;
    // content: comment 필수
    content?: string;
  };
}

export interface Notification {
  from: string;
  to: string;
  type: NotificationType;
  data?: NotificationData;
}

export interface NotificationResponse {
  id: number;
  from: UserProfile;
  type: NotificationType;
  data: NotificationData | null;
  createdAt: string;
}
