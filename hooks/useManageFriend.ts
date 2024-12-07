import { showToast } from "@/components/ToastConfig";
import { NOTIFICATION_TYPE } from "@/types/Notification.interface";
import type { UserProfile } from "@/types/User.interface";
import {
  createFriendRequest,
  createNotification,
  deleteFriendRequest,
  deleteFriendRequestWithUserId,
  putFriendRequest,
  putFriendRequestWithUserId,
} from "@/utils/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateProps {
  fromUserId: string;
  toUserId: string;
}

interface AcceptProps {
  requestId?: number;
  fromUserId: string;
  toUserId: string;
}

interface RefuseProps {
  requestId: number;
  fromUserId: string;
  toUserId: string;
}

interface UnfriendProps {
  fromUserId: string;
  toUserId: string;
}

interface PokeProps {
  userId?: string;
  friend: UserProfile;
}

const useManageFriend = () => {
  const queryClient = useQueryClient();

  // 친구 요청 생성
  const useCreateRequest = () => {
    const { mutate, isPending } = useMutation<CreateProps, Error, CreateProps>({
      mutationFn: async ({ fromUserId, toUserId }) => {
        await createFriendRequest(fromUserId, toUserId, null);
        return { fromUserId, toUserId };
      },
      onSuccess: ({ fromUserId, toUserId }) => {
        queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({
          queryKey: ["relation", fromUserId, toUserId],
        });
      },
      onError: (error) => {
        console.error("친구 요청 생성 실패:", error);
        showToast("fail", "요청 보내기에 실패했어요!");
      },
    });
    return { mutate, isPending };
  };

  // 친구 요청 수락
  const useAcceptRequest = () => {
    const { mutate, isPending } = useMutation<AcceptProps, Error, AcceptProps>({
      mutationFn: async ({ requestId, fromUserId, toUserId }) => {
        await Promise.all([
          requestId
            ? putFriendRequest(requestId, true)
            : putFriendRequestWithUserId(fromUserId, toUserId, true),
          createFriendRequest(toUserId, fromUserId, true),
        ]);
        return { fromUserId, toUserId };
      },
      onSuccess: ({ fromUserId, toUserId }) => {
        queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({
          queryKey: ["relation", toUserId, fromUserId],
        });
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
    const { mutate, isPending } = useMutation<RefuseProps, Error, RefuseProps>({
      mutationFn: async ({ requestId, fromUserId, toUserId }) => {
        await deleteFriendRequest(requestId);
        return { requestId, fromUserId, toUserId };
      },
      onSuccess: ({ fromUserId, toUserId }) => {
        queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        queryClient.invalidateQueries({
          queryKey: ["relation", fromUserId, toUserId],
        });
      },
      onError: (error) => {
        console.error("친구 요청 거절 실패:", error);
        showToast("fail", "요청 거절에 실패했어요!");
      },
    });
    return { mutate, isPending };
  };

  // 친구 끊기
  const useUnfriend = () => {
    const { mutate, isPending } = useMutation<
      UnfriendProps,
      Error,
      UnfriendProps
    >({
      mutationFn: async ({ fromUserId, toUserId }) => {
        await Promise.all([
          deleteFriendRequestWithUserId(fromUserId, toUserId),
          deleteFriendRequestWithUserId(toUserId, fromUserId),
        ]);
        return { fromUserId, toUserId };
      },
      onSuccess: ({ fromUserId, toUserId }) => {
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        queryClient.invalidateQueries({
          queryKey: ["relation", fromUserId, toUserId],
        });
      },
      onError: (error) => {
        console.error("친구 끊기 실패:", error);
        showToast("fail", "친구 끊기를 실패했어요!");
      },
    });
    return { mutate, isPending };
  };

  // 친구 콕 찌르기
  const usePoke = () => {
    const { mutate } = useMutation<PokeProps, Error, PokeProps>({
      mutationFn: async ({ userId, friend }) => {
        if (!userId) throw new Error("계정 정보가 없습니다.");

        await createNotification({
          from: userId,
          to: friend.id,
          type: NOTIFICATION_TYPE.POKE,
        });

        return { userId, friend };
      },
      onSuccess: ({ userId, friend }) => {
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

  return {
    useCreateRequest,
    useAcceptRequest,
    useRefuseRequest,
    useUnfriend,
    usePoke,
  };
};

export default useManageFriend;
