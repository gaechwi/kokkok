export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  description: string;
  status?: "DONE" | "REST";
}

export const USERS: User[] = [
  {
    id: "1",
    email: "",
    username: "개발자",
    avatarUrl:
      "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1730962073092-thumbnail.webp",
    description: "블로그 개발자입니다.",
    status: "DONE",
  },
  {
    id: "2",
    email: "",
    username: "개발자2",
    avatarUrl:
      "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1731427831515-thumbnail.webp",
    description: "저도 블로그 개발자입니다.",
  },
  {
    id: "3",
    email: "",
    username: "개발자3",
    avatarUrl:
      "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1731865249691-thumbnail.webp",
    description: "블로그 개발자입니다.",
    status: "REST",
  },
];
