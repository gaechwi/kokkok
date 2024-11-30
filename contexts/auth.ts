import { atom } from "jotai";

interface SignUpForm {
  email: string;
  password: string;
  username: string;
  avatar: string;
  description?: string;
}

export const signUpFormAtom = atom<SignUpForm>({
  email: "",
  password: "",
  username: "",
  avatar: "",
  description: "",
});
