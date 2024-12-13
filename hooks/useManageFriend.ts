import { showToast } from "@/components/ToastConfig";
import { NOTIFICATION_TYPE } from "@/types/Notification.interface";
import type { UserProfile } from "@/types/User.interface";
import { shorten_comment } from "@/utils/formMessage";
import {
  acceptFriendRequest,
  checkFriendRequest,
  checkFriendRequestWithUserId,
  createFriendRequest,
  createNotification,
  deleteFriendRequest,
  deleteFriendRequestWithUserId,
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
  user: UserProfile;
  friend: UserProfile;
}

class NoRequestError extends Error {
  from: string;
  to: string;

  constructor(message: string, from: string, to: string) {
    super(message);
    this.from = from;
    this.to = to;
  }
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
        // 친구 요청이 그사이 취소되었는지 확인
        const hasFriendRequest = requestId
          ? await checkFriendRequest(String(requestId))
          : await checkFriendRequestWithUserId(fromUserId, toUserId);
        if (!hasFriendRequest) {
          throw new NoRequestError(
            "친구 요청이 유효하지 않습니다.",
            fromUserId,
            toUserId,
          );
        }

        await acceptFriendRequest(fromUserId, toUserId, requestId);
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
        if (error instanceof NoRequestError) {
          // 친구 요청이 취소되어 발생한 에러라면 관련된 값 다시 불러오도록
          queryClient.invalidateQueries({ queryKey: ["friendRequest"] });
          queryClient.invalidateQueries({
            queryKey: ["relation", error.to, error.from],
          });
        }
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
      mutationFn: async ({ user, friend }) => {
        if (!user) throw new Error("계정 정보가 없습니다.");

        await createNotification({
          from: user,
          to: friend.id,
          type: NOTIFICATION_TYPE.POKE,
        });

        return { user, friend };
      },
      onSuccess: ({ user, friend }) => {
        if (!user) return;

        queryClient.invalidateQueries({
          queryKey: ["poke", user.id, friend.id],
        });
        showToast(
          "success",
          `👈 ${shorten_comment(friend.username, 10)}님을 콕! 찔렀어요`,
        );
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
