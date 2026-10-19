"use client";

import type { FormEventHandler } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { Button } from "@acme/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";
import { SignUpSchema } from "@acme/validators";

import { authClient } from "~/auth/client";

const FIELDS = [
  {
    name: "email",
    label: "メールアドレス",
    type: "email",
    placeholder: "example@email.com",
    autoComplete: "email",
  },
  {
    name: "name",
    label: "名前",
    type: "text",
    placeholder: "山田 太郎",
    autoComplete: "name",
  },
  {
    name: "password",
    label: "パスワード",
    type: "password",
    placeholder: "英字と数字を含む8文字以上",
    autoComplete: "new-password",
  },
  {
    name: "passwordConfirm",
    label: "パスワード（確認）",
    type: "password",
    placeholder: "もう一度入力してください",
    autoComplete: "new-password",
  },
] as const;

export default function SignUpForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
      passwordConfirm: "",
    },
    validators: {
      onChange: SignUpSchema,
      onSubmit: SignUpSchema,
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signUp.email({
        email: value.email.toLowerCase(),
        name: value.name.trim(),
        password: value.password,
      });

      if (error) {
        toast.error(
          error.code?.startsWith("USER_ALREADY_EXISTS")
            ? "このメールアドレスは既に登録されています。"
            : "会員登録に失敗しました。しばらくしてから再度お試しください。",
        );
        return;
      }

      toast.success("会員登録が完了しました。ログインしてください。");
      router.push("/");
    },
  });

  const handleSubmitForm: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmitForm} noValidate>
      <FieldGroup>
        {FIELDS.map((item) => (
          <form.Field key={item.name} name={item.name}>
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{item.label}</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={item.type}
                    value={field.state.value}
                    placeholder={item.placeholder}
                    autoComplete={item.autoComplete}
                    aria-invalid={isInvalid}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        ))}

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isSubmitting} className="h-11">
                {isSubmitting ? "登録中…" : "会員登録"}
              </Button>
              <Button asChild variant="outline" className="h-11">
                <Link href="/">ログイン画面に戻る</Link>
              </Button>
            </div>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
