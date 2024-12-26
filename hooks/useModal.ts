import { setModalStateAtom } from "@/contexts/modal.atom";
import type { ModalType } from "@/types/Modal.interface";
import { useAtom } from "jotai";

export function useModal() {
  const [, setModalState] = useAtom(setModalStateAtom);

  const openModal = (
    modal: ModalType,
    position: "center" | "bottom" = "center",
  ) => {
    setModalState({
      isOpen: true,
      modal,
      position,
    });
  };
  const closeModal = () => {
    setModalState({
      isOpen: false,
      modal: null,
      position: undefined,
    });
  };

  return { openModal, closeModal };
}
