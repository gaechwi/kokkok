// 게시글 타입 정의
export interface Post {
  id: number;
  images: string[];
  contents: string | undefined;
  createdAt: string;
  likes: number;
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
