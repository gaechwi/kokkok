import { Image, Text, View } from "react-native";

import images from "@/constants/images";
import {
  NOTIFICATION_TYPE,
  type NotificationResponse,
} from "@/types/Notification.interface";
import { diffDate } from "@/utils/formatDate";

const COMMENT_MAX_LENGTH = 18;
const shorten_comment = (comment: string) =>
  `"${comment.length > COMMENT_MAX_LENGTH ? comment.slice(0, COMMENT_MAX_LENGTH).concat("...") : comment}"`;

/* Components */

export function NotificationItem({
  from,
  type,
  data,
  createdAt,
}: NotificationResponse) {
  const NOTIFICATION_CONFIG = {
    [NOTIFICATION_TYPE.POKE]: {
      title: "👈 콕!",
      content: `${from.username}님이 콕 찌르셨어요.`,
    },
    [NOTIFICATION_TYPE.COMMENT]: {
      title: `${from.username}님의 댓글`,
      content: shorten_comment(data?.commentInfo?.content || ""),
    },
    [NOTIFICATION_TYPE.COMMENT_LIKE]: {
      title: [`${from.username}님이`, "댓글에 좋아요를 눌렀어요❤️"],
    },
    [NOTIFICATION_TYPE.LIKE]: {
      title: [`${from.username}님이`, "게시글에 좋아요를 눌렀어요❤️"],
    },
  };

  const diff = diffDate(new Date(createdAt));

  return (
    <View className="w-full py-4 border-b border-gray-25 flex-row justify-between items-center">
      <View className="flex-row gap-4">
        <Image
          source={
            from.avatarUrl ? { uri: from.avatarUrl } : images.AvaTarDefault
          }
          style={{ width: 48, height: 48, borderRadius: 9999 }}
        />

        <View className="gap-[4px] w-[198px]">
          {type === "like" || type === "commentLike" ? (
            <>
              <Text className="title-4 text-gray-90" numberOfLines={1}>
                {NOTIFICATION_CONFIG[type].title[0]}
              </Text>
              <Text className="title-4 text-gray-90" numberOfLines={1}>
                {NOTIFICATION_CONFIG[type].title[1]}
              </Text>
            </>
          ) : (
            <>
              <Text className="title-4 text-gray-90" numberOfLines={1}>
                {NOTIFICATION_CONFIG[type].title}
              </Text>
              <Text className="body-5 text-gray-45" numberOfLines={1}>
                {NOTIFICATION_CONFIG[type].content}
              </Text>
            </>
          )}
        </View>
      </View>

      <Text className="caption-3 font-pmedium text-gray-50">{diff}</Text>
    </View>
  );
}
