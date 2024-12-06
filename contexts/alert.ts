import { atom } from "jotai";

interface AlertToggleState {
  like: boolean;
  comment: boolean;
  all: boolean;
}

export const alertToggleAtom = atom<AlertToggleState>({
  like: false,
  comment: false,
  all: false,
});
