import { View } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "@tanstack/react-form";

import { SignInSchema } from "@acme/validators";

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

      router.replace("/todo");
    },
  });

  const handleSubmitForm = () => {
    void form.handleSubmit();
  };

  return (
    <FieldGroup>
      <form.Field name="email">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field>
              <FieldLabel invalid={isInvalid}>メールアドレス</FieldLabel>
              <Input
                value={field.state.value}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
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

      <form.Field name="password">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field>
              <FieldLabel invalid={isInvalid}>パスワード</FieldLabel>
              <Input
                value={field.state.value}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="done"
                invalid={isInvalid}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                onSubmitEditing={handleSubmitForm}
                className="h-11"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <View className="flex flex-col gap-2">
            <Button
              disabled={isSubmitting}
              onPress={handleSubmitForm}
              className="h-11"
            >
              {isSubmitting ? "ログイン中…" : "ログイン"}
            </Button>
            <Button
              variant="outline"
              onPress={() => router.push("/signup")}
              className="h-11"
            >
              会員登録
            </Button>
          </View>
        )}
      </form.Subscribe>
    </FieldGroup>
  );
}
