import type { ModalState } from "@/types/Modal.interface";
import { atom } from "jotai";

export const modalStateAtom = atom<ModalState>({
  isOpen: false,
  position: "center",
  modal: null,
  previousPosition: null,
});

export const setModalStateAtom = atom(
  (get) => get(modalStateAtom),
  (get, set, update: Partial<ModalState>) => {
    const current = get(modalStateAtom);

    const previousPosition =
      !current.isOpen && update.isOpen ? null : current.position;

    set(modalStateAtom, {
      ...current,
      ...update,
      previousPosition,
    });
  },
);
