import type { StatusType, UserProfile } from "./User.interface";

export interface RequestInfo {
  requestId: string;
  toUserId: string;
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
