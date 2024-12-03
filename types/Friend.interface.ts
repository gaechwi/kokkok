import type { User } from "./User.interface";

export interface RequestInfo {
  requestId: string;
  toUserId: string;
  fromUser: User;
}

export interface RequestResponse {
  data: RequestInfo[];
  total: number;
  hasMore: boolean;
}

export interface FriendResponse {
  data: User[];
  total: number;
  hasMore: boolean;
}
