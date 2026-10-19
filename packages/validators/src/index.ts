import { z } from "zod/v4";

const EmailSchema = z.email("メールアドレスの形式が正しくありません。");

const NameSchema = z
  .string()
  .trim()
  .min(1, "名前を入力してください。")
  .max(50, "名前は50文字以内で入力してください。");

const PasswordSchema = z
  .string()
  .min(8, "パスワードは8文字以上で入力してください。")
  .max(128, "パスワードは128文字以内で入力してください。")
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d).+$/,
    "パスワードは英字と数字を含めてください。",
  );

export const SignInSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "パスワードを入力してください。"),
});

// 会員登録: メールアドレスをそのままログインIDとして使用する
export const SignUpSchema = z
  .object({
    email: EmailSchema,
    name: NameSchema,
    password: PasswordSchema,
    passwordConfirm: z.string().min(1, "確認用パスワードを入力してください。"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "パスワードが一致しません。",
    path: ["passwordConfirm"],
  });
