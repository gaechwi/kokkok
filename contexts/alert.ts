import { atom } from "jotai";

interface AlertToggleState {
  like: boolean;
  comment: boolean;
}

export const alertToggleAtom = atom<AlertToggleState>({
  like: false,
  comment: false,
});

// derived atom - like와 comment 모두 true일 때 true
export const allAlertAtom = atom(
  (get) => {
    const state = get(alertToggleAtom);
    return state.like || state.comment;
  },
  (_get, set, newValue: boolean) => {
    set(alertToggleAtom, {
      like: newValue,
      comment: newValue,
    });
  },
);
