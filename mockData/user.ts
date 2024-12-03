export interface User {
  accountId: string;
  username: string;
  avatarUrl: string;
  description: string;
  status?: "DONE" | "REST";
}

export const USERS: User[] = [
  {
    accountId: "1",
    username: "개발자",
    avatarUrl:
      "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1730962073092-thumbnail.webp",
    description: "블로그 개발자입니다.",
    status: "DONE",
  },
  {
    accountId: "2",
    username: "개발자2",
    avatarUrl:
      "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1731427831515-thumbnail.webp",
    description: "저도 블로그 개발자입니다.",
  },
  {
    accountId: "3",
    username: "개발자3",
    avatarUrl:
      "https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1731865249691-thumbnail.webp",
    description: "블로그 개발자입니다.",
    status: "REST",
  },
];
