"use client";

import type { FormEventHandler } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { Button } from "@acme/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";
import { SignInSchema } from "@acme/validators";

import { authClient } from "~/auth/client";

export default function SignInForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: SignInSchema,
      onSubmit: SignInSchema,
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signIn.email(value);

      if (error) {
        toast.error(
          error.code === "INVALID_EMAIL_OR_PASSWORD"
            ? "メールアドレスまたはパスワードが正しくありません。"
            : "ログインに失敗しました。しばらくしてから再度お試しください。",
        );
        return;
      }

      router.push("/todo");
      router.refresh();
    },
  });

  const handleSubmitForm: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmitForm} noValidate>
      <FieldGroup>
        <form.Field name="email">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>メールアドレス</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  placeholder="example@email.com"
                  autoComplete="email"
                  aria-invalid={isInvalid}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>パスワード</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  autoComplete="current-password"
                  aria-invalid={isInvalid}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isSubmitting} className="h-11">
                {isSubmitting ? "ログイン中…" : "ログイン"}
              </Button>
              <Button asChild variant="outline" className="h-11">
                <Link href="/signup">会員登録</Link>
              </Button>
            </div>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
