// 추후 적당한 위치로 이동
const FIT_STATUS = {
  done: undefined,
  rest: undefined,
} as const;
export type StatusType = keyof typeof FIT_STATUS;

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  description: string;
  status?: StatusType;
}

export interface User extends UserProfile {
  email: string;
}
