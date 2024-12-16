import type { StatusType, UserProfile } from "./User.interface";

export const RELATION_TYPE = {
  ASKING: "asking", // 내가 친구 요청 보냄
  ASKED: "asked", // 친구 요청 받음
  FRIEND: "friend", // 친구
  NONE: "none", // 서로 아무 관계 아님
} as const;
export type RelationType = (typeof RELATION_TYPE)[keyof typeof RELATION_TYPE];

export interface RequestInfo {
  requestId: number;
  toUser: UserProfile;
  fromUser: UserProfile;
}

export interface RequestResponse {
  data: RequestInfo[];
  total: number;
  hasMore: boolean;
}

export interface FriendResponse {
  friends: UserProfile[];
  friendIds: string[];
}

export interface StatusInfo {
  userId: string;
  status: StatusType;
}
