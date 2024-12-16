import { atom } from "jotai";

interface SignUpForm {
  email: string;
  password: string;
  username: string;
  description?: string;
}

interface PasswordResetForm {
  email: string;
}

export const signUpFormAtom = atom<SignUpForm>({
  email: "",
  password: "",
  username: "",
  description: "",
});

export const passwordResetFormAtom = atom<PasswordResetForm>({
  email: "",
});
