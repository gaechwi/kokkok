import { Image, Text, TouchableOpacity, View } from "react-native";

import icons from "@/constants/icons";

// 추후 적당한 위치로 이동
const FIT_STATUS = {
  DEFAULT: "기본",
  DONE: "운동함",
  NOT_DONE: "안함",
  REST: "쉬는 날",
} as const;
type StatusType = keyof typeof FIT_STATUS;

/* Interfaces */

interface FriendProfileProps {
  nickname: string;
  avatar: string;
  description: string;
}

interface FriendItemProps extends FriendProfileProps {
  status: StatusType;
}

/* SubComponent */

const FriendProfile = ({
  nickname,
  avatar,
  description,
}: FriendProfileProps) => (
  <View className="flex-row gap-2">
    <Image src={avatar} className="size-[48px] rounded-full" />
    <View className="gap-[4px]">
      <Text className="title-4 text-gray-90">{nickname}</Text>
      <Text className="caption-3 text-gray-45">{description}</Text>
    </View>
  </View>
);

/* Components */

export function FriendItem({
  nickname,
  avatar,
  description,
  status,
}: FriendItemProps) {
  return (
    <View className="py-4 border-b-[1px] border-gray-25 flex-row justify-between items-center">
      <FriendProfile
        nickname={nickname}
        avatar={avatar}
        description={description}
      />

      <TouchableOpacity
        className={`${status === "NOT_DONE" ? "bg-primary" : "bg-gray-40"} w-[89px] h-[36px] rounded-[10px] flex-row items-center justify-center`}
        disabled={status !== "NOT_DONE"}
      >
        {status === "DONE" ? (
          <View className="flex-row">
            <Text className="body-5 text-white mr-[5px]">운동 완료</Text>
            <icons.FaceDoneIcon width={19} height={19} />
          </View>
        ) : status === "REST" ? (
          <View className="flex-row">
            <Text className="body-5 text-white mr-[8px]">쉬는 중</Text>
            <icons.FaceRestIcon width={19} height={19} />
          </View>
        ) : (
          <Text className="body-5 text-white">👈 콕 찌르기 </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
