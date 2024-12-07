import { showToast } from "@/components/ToastConfig";
import { NOTIFICATION_TYPE } from "@/types/Notification.interface";
import type { UserProfile } from "@/types/User.interface";
import {
  createFriendRequest,
  createNotification,
  deleteFriendRequest,
  putFriendRequest,
} from "@/utils/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AcceptProps {
  requestId: number;
  fromUserId: string;
  toUserId: string;
}

interface RefuseProps {
  requestId: number;
}

interface PokeProps {
  userId?: string;
  friend: UserProfile;
}

const useManageFriend = () => {
  const queryClient = useQueryClient();

  // 친구 요청 수락
  const useAcceptRequest = () => {
    const { mutate, isPending } = useMutation<void, Error, AcceptProps>({
      mutationFn: async ({ requestId, fromUserId, toUserId }) => {
        await Promise.all([
          putFriendRequest(requestId, true),
          createFriendRequest(toUserId, fromUserId, true),
        ]);
      },
      onSuccess: () => {
        console.log("accept success");
        queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
      },
      onError: (error) => {
        console.error("친구 요청 수락 실패:", error);
        showToast("fail", "요청 수락에 실패했어요!");
      },
    });

    return { mutate, isPending };
  };

  // 친구 요청 거절
  const useRefuseRequest = () => {
    const { mutate, isPending } = useMutation<void, Error, RefuseProps>({
      mutationFn: async ({ requestId }) => {
        await deleteFriendRequest(requestId);
      },
      onSuccess: () => {
        console.log("refuse success");
        queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      },
      onError: (error) => {
        console.error("친구 요청 거절 실패:", error);
        showToast("fail", "요청 거절에 실패했어요!");
      },
    });
    return { mutate, isPending };
  };

  // 친구 콕 찌르기
  const usePoke = ({ userId, friend }: PokeProps) => {
    const { mutate } = useMutation({
      mutationFn: async () => {
        if (!userId) {
          showToast("fail", "계정 정보가 없습니다.");
          return;
        }

        await createNotification({
          from: userId,
          to: friend.id,
          type: NOTIFICATION_TYPE.POKE,
        });
      },
      onSuccess: () => {
        if (!userId) return;

        queryClient.invalidateQueries({
          queryKey: ["poke", userId, friend.id],
        });
        showToast("success", `👈 ${friend.username}님을 콕! 찔렀어요`);
      },
      onError: (error) => {
        console.error("콕 찌르기 실패:", error);
        showToast("fail", "콕 찌르기에 실패했어요!");
      },
    });

    return { mutate };
  };

  return { useAcceptRequest, useRefuseRequest, usePoke };
};

export default useManageFriend;
