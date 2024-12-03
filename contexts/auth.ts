import { atom } from "jotai";

interface SignUpForm {
  email: string;
  password: string;
  username: string;
  avatar: string;
  description?: string;
}

interface PasswordResetForm {
  email: string;
}

export const signUpFormAtom = atom<SignUpForm>({
  email: "",
  password: "",
  username: "",
  avatar: "",
  description: "",
});

export const passwordResetFormAtom = atom<PasswordResetForm>({
  email: "",
});
