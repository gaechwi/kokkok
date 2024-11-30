import { User, USERS } from "./user";

export interface Notification {
  id: string;
  actor: User;
  type: "POKE" | "COMMENT" | "LIKE";
  postId?: string;
  comment?: string;
  createdAt: string;
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    actor: USERS[0],
    type: "POKE",
    createdAt: "2024-11-29",
  },
  {
    id: "2",
    actor: USERS[1],
    type: "COMMENT",
    postId: "1",
    comment: "완전 열심히 운동하시네요 맨날 동일한 시간에 하시나요?",
    createdAt: "2024-11-27",
  },
  {
    id: "3",
    actor: USERS[2],
    type: "LIKE",
    postId: "2",
    createdAt: "2024-10-27",
  },
  {
    id: "4",
    actor: USERS[0],
    type: "COMMENT",
    postId: "2",
    comment: "오늘도 화아팅!",
    createdAt: "2023-11-27",
  },
];
