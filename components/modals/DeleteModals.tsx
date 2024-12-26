import { useModal } from "@/hooks/useModal";
import { deleteComment, deletePost } from "@/utils/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "../ToastConfig";
import { DeleteModal } from "./ModalProvider";

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
