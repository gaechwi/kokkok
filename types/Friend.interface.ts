import type { UserProfile } from "./User.interface";

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
  data: UserProfile[];
  total: number;
  hasMore: boolean;
}
