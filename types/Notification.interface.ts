import type { UserProfile } from "./User.interface";

export const NOTIFICATION_TYPE = {
  POKE: "poke",
  COMMENT: "comment",
  COMMENT_LIKE: "commentLike",
  LIKE: "like",
  MENTION: "mention",
  FRIEND: "friend",
} as const;
export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export interface NotificationData {
  postId?: number;
  commentInfo?: {
    id: number;
    content?: string;
  };
  isAccepted?: boolean;
}

export interface Notification {
  from: UserProfile;
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

export interface PushSetting {
  userId: string;
  token: string | null;
  grantedNotifications: NotificationType[];
}

export interface PushSettingUpdateData {
  userId: string;
  token?: string | null;
  grantedNotifications?: NotificationType[];
}

export interface PushMessage {
  to: string;
  sound: string;
  title: string;
  body: string;
}
