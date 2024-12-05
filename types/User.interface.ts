export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  description: string;
}

export interface User extends UserProfile {
  email: string;
}
