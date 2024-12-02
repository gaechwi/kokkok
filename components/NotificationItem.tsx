import { Image, Text, View } from "react-native";

import images from "@/constants/images";
import { diffDate } from "@/utils/formatDate";
import { User } from "@/mockData/user";

interface NotificationItemProps {
  actor: User;
  type: "POKE" | "COMMENT" | "LIKE";
  postId?: string; // 포스트로 이동하려면 필요. 아직 미정.
  comment?: string;
  createdAt: string;
  checked?: boolean;
}

const COMMENT_MAX_LENGTH = 18;
const shorten_comment = (comment: string) =>
  `"${comment.length > COMMENT_MAX_LENGTH ? comment.slice(0, COMMENT_MAX_LENGTH).concat("...") : comment}"`;

/* Components */

export function NotificationItem({
  actor,
  type,
  postId,
  comment,
  createdAt,
  checked = false,
}: NotificationItemProps) {
  const NOTIFICATION_CONFIG = {
    POKE: {
      titles: ["👈 콕!"],
      content: `${actor.nickname}님이 콕 찌르셨어요.`,
    },
    COMMENT: {
      titles: [`${actor.nickname}님의 댓글`],
      content: shorten_comment(comment || ""),
    },
    LIKE: {
      titles: [`${actor.nickname}님이`, "게시글에 좋아요를 눌렀어요❤️"],
    },
  };

  const diff = diffDate(new Date(createdAt));

  return (
    <View className={`${checked ? "bg-gray-5" : ""} px-8`}>
      <View className="w-full py-4 border-b border-gray-25 flex-row justify-between items-center">
        <View className="flex-row gap-4">
          <Image
            src={actor.avatar}
            defaultSource={images.AvaTarDefault}
            style={{ width: 48, height: 48, borderRadius: 9999 }}
          />

          <View className="gap-[4px] w-[198px]">
            {NOTIFICATION_CONFIG[type].titles.map((title) => (
              <Text
                key={title}
                className={`title-4 text-gray-90 ${type === "LIKE" ? "" : "truncate"}`}
              >
                {title}
              </Text>
            ))}

            {type !== "LIKE" && (
              <Text className="body-5 text-gray-45">
                {NOTIFICATION_CONFIG[type].content}
              </Text>
            )}
          </View>
        </View>

        {!checked && (
          <Text className="caption-3 font-pmedium text-gray-50">{diff}</Text>
        )}
      </View>
    </View>
  );
}
