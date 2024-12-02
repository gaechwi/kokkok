import { User } from "./User.interface";

export interface RequestInfo {
  id: string;
  from: User;
}

export interface RequestResponse {
  data: RequestInfo[];
  total: number;
  hasMore: boolean;
}
