import Icons from "@/constants/icons";
import { useModal } from "@/hooks/useModal";
import { deleteComment, deletePost } from "@/utils/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import { showToast } from "../ToastConfig";

export function DeleteModal({
  onClose,
  onDelete,
}: { onClose: () => void; onDelete: () => void }) {
  return (
    <View className="px-7">
      <View className="items-center rounded-xl bg-white p-6 ">
        <Icons.TrashCanIcon width={30} height={38} />

        <Text className="title-3 mt-4 text-center text-gray-90">
          삭제하면 되돌릴 수 없어요{"\n"}그래도 삭제하시겠어요?
        </Text>

        <View className="mt-5 h-[52px] flex-row items-center gap-5">
          <TouchableOpacity
            onPress={onClose}
            className="h-full grow items-center justify-center rounded-[8px] bg-gray-40"
          >
            <Text className="title-3 text-white">취소</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            className="h-full grow items-center justify-center rounded-[8px] bg-primary"
          >
            <Text className="title-3 text-white">삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// 게시글 삭제 모달
export function DeletePostModal({ postId }: { postId: number }) {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      if (postId) await deletePost(postId);
    },
    onSuccess: () => {
      showToast("success", "게시글이 삭제되었어요.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      showToast("fail", "게시글 삭제에 실패했어요.");
    },
  });

  return (
    <DeleteModal
      onClose={closeModal}
      onDelete={() => {
        if (!deletePostMutation.isPending) {
          deletePostMutation.mutate();
          closeModal();
        }
      }}
    />
  );
}

// 댓글 삭제 모달
export function DeleteCommentModal({
  postId,
  commentId,
}: { postId: number; commentId: number }) {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const deleteCommentMutation = useMutation({
    mutationFn: async () => {
      if (commentId) await deleteComment(commentId);
    },
    onSuccess: () => {
      showToast("success", "댓글이 삭제되었어요.");

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["replies"] });
    },
    onError: () => {
      showToast("fail", "댓글 삭제에 실패했어요.");
    },
  });

  return (
    <DeleteModal
      onClose={closeModal}
      onDelete={() => {
        if (!deleteCommentMutation.isPending) {
          deleteCommentMutation.mutate();
          closeModal();
        }
      }}
    />
  );
}
