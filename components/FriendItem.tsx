import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import icons from "@/constants/icons";
import images from "@/constants/images";
import {
  createFriendRequest,
  deleteFriendRequest,
  putFriendRequest,
} from "@/utils/supabase";
import type { UserProfile } from "@/types/User.interface";

// 추후 적당한 위치로 이동
const FIT_STATUS = {
  DONE: "운동함",
  REST: "쉬는 날",
} as const;
type StatusType = keyof typeof FIT_STATUS;

/* Interfaces */

interface FriendProfileProps {
  username: string;
  avatarUrl: string;
  description: string;
}

interface FriendItemProps {
  fromUser: UserProfile;
  status?: StatusType;
}

interface FriendRequestProps {
  requestId: string;
  toUserId: string;
  fromUser: UserProfile;
  isLoading: boolean;
}

/* SubComponent */

const FriendProfile = ({
  username,
  avatarUrl,
  description,
}: FriendProfileProps) => (
  <View className="flex-row gap-2">
    <Image
      source={{ uri: avatarUrl }}
      defaultSource={images.AvaTarDefault}
      style={{ width: 48, height: 48, borderRadius: 9999 }}
    />
    <View className="gap-[4px] w-[150px]">
      <Text className="title-4 text-gray-90" numberOfLines={1}>
        {username}
      </Text>
      <Text className="caption-3 text-gray-45" numberOfLines={1}>
        {description}
      </Text>
    </View>
  </View>
);

/* Components */

export function FriendItem({ fromUser, status }: FriendItemProps) {
  return (
    <View className="py-4 px-2 border-b-[1px] border-gray-25 flex-row justify-between items-center">
      <FriendProfile {...fromUser} />

      <TouchableOpacity
        className="bg-primary disabled:bg-gray-40 w-[89px] h-[36px] rounded-[10px] flex-row items-center justify-center"
        disabled={!!status}
        accessibilityLabel="친구 찌르기"
        accessibilityHint="이 버튼을 누르면 친구에게 찌르기 알람을 보냅니다"
      >
        {status === "DONE" ? (
          <View className="flex-row items-center justify-center">
            <Text className="body-5 text-white mr-[5px]">운동 완료</Text>
            <icons.FaceDoneIcon width={19} height={19} />
          </View>
        ) : status === "REST" ? (
          <View className="flex-row items-center justify-center">
            <Text className="body-5 text-white mr-[8px]">쉬는 중</Text>
            <icons.FaceRestIcon width={19} height={19} />
          </View>
        ) : (
          <Text className="body-5 text-white">👈 콕 찌르기</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export function FriendRequest({
  requestId,
  toUserId,
  fromUser,
  isLoading,
}: FriendRequestProps) {
  const queryClient = useQueryClient();

  const { mutate: handleAccept, isPending: isAcceptPending } = useMutation({
    mutationFn: async () => {
      await Promise.all([
        putFriendRequest(requestId, true),
        createFriendRequest(toUserId, fromUser.id, true),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error) => {
      Alert.alert(
        "친구 요청 수락 실패",
        error instanceof Error
          ? error.message
          : "친구 요청 수락에 실패했습니다",
      );
    },
  });

  const { mutate: handleRefuse, isPending: isRefusePending } = useMutation({
    mutationFn: async () => {
      await deleteFriendRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
    onError: (error) => {
      Alert.alert(
        "친구 요청 거절 실패",
        error instanceof Error
          ? error.message
          : "친구 요청 거절에 실패했습니다",
      );
    },
  });

  return (
    <View className="py-4 border-b-[1px] border-gray-25 flex-row justify-between items-center">
      <FriendProfile {...fromUser} />

      <View className="flex-row gap-[11px]">
        <TouchableOpacity
          className="bg-primary px-[12px] py-[11px] rounded-[10px]"
          onPress={() => handleAccept()}
          disabled={isAcceptPending || isRefusePending || isLoading}
          accessibilityLabel="친구 요청 수락"
          accessibilityHint="이 버튼을 누르면 친구 요청을 수락합니다"
        >
          <Text className="caption-1 font-pmedium text-white">수락</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white  px-[12px] py-[11px] rounded-[10px] border-primary border-[1px]"
          onPress={() => handleRefuse()}
          disabled={isAcceptPending || isRefusePending || isLoading}
          accessibilityLabel="친구 요청 거절"
          accessibilityHint="이 버튼을 누르면 친구 요청을 거절합니다"
        >
          <Text className="caption-1 font-pmedium text-gray-90">거절</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
