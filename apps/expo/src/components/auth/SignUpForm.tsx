import type { TextInputProps } from "react-native";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "@tanstack/react-form";

import { SignUpSchema } from "@acme/validators";

import { Button } from "~/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { toast } from "~/components/ui/toast";
import { authClient } from "~/utils/auth";

const FIELDS = [
  {
    name: "email",
    label: "メールアドレス",
    placeholder: "example@email.com",
    inputProps: {
      keyboardType: "email-address",
      autoCapitalize: "none",
      autoComplete: "email",
      textContentType: "emailAddress",
    },
  },
  {
    name: "name",
    label: "名前",
    placeholder: "山田 太郎",
    inputProps: {
      autoComplete: "name",
      textContentType: "name",
    },
  },
  {
    name: "password",
    label: "パスワード",
    placeholder: "英字と数字を含む8文字以上",
    inputProps: {
      secureTextEntry: true,
      autoCapitalize: "none",
      autoComplete: "new-password",
      textContentType: "newPassword",
    },
  },
  {
    name: "passwordConfirm",
    label: "パスワード（確認）",
    placeholder: "もう一度入力してください",
    inputProps: {
      secureTextEntry: true,
      autoCapitalize: "none",
      autoComplete: "new-password",
      textContentType: "newPassword",
    },
  },
] as const satisfies {
  name: string;
  label: string;
  placeholder: string;
  inputProps: TextInputProps;
}[];

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
      router.dismissTo("/");
    },
  });

  const handleSubmitForm = () => {
    void form.handleSubmit();
  };

  return (
    <FieldGroup>
      {FIELDS.map((item) => (
        <form.Field key={item.name} name={item.name}>
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field>
                <FieldLabel invalid={isInvalid}>{item.label}</FieldLabel>
                <Input
                  {...item.inputProps}
                  value={field.state.value}
                  placeholder={item.placeholder}
                  invalid={isInvalid}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  className="h-11"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      ))}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <View className="flex flex-col gap-2">
            <Button
              disabled={isSubmitting}
              onPress={handleSubmitForm}
              className="h-11"
            >
              {isSubmitting ? "登録中…" : "会員登録"}
            </Button>
            <Button
              variant="outline"
              onPress={() => router.dismissTo("/")}
              className="h-11"
            >
              ログイン画面に戻る
            </Button>
          </View>
        )}
      </form.Subscribe>
    </FieldGroup>
  );
}
