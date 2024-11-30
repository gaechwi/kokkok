export interface FriendRequest {
  id: string;
  requester: string;
  requestee: string;
  isAccepted: boolean | null;
}
