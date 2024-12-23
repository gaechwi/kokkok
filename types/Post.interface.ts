interface UserData {
  id: string;
  username: string;
  avatarUrl: string | null;
}

interface CommentData {
  id: number;
  contents: string;
  createdAt: string;
  userId: string;
  author: UserData;
}

// 게시글 타입 정의
export interface Post {
  id: number;
  images: string[];
  contents: string | null;
  createdAt: string;
  userData: UserData;
  commentData: CommentData;
  totalComments: number;
  likedAvatars: string[];
  isLikedByUser: boolean;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  postId: number;
  createdAt: string;
  liked: boolean;
  likedAuthorAvatar: string[];
}
