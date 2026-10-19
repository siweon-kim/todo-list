import { View } from "react-native";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateTodoSchema } from "@acme/db/validators";

import { Button } from "~/components/ui/button";
import { Field, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { toast } from "~/components/ui/toast";
import { trpc } from "~/utils/api";

export default function CreateTodoForm() {
  const queryClient = useQueryClient();

  const createTodo = useMutation(
    trpc.todo.create.mutationOptions({
      onSuccess: async () => {
        form.reset();
        await queryClient.invalidateQueries(trpc.todo.pathFilter());
      },

      onError: (err) => {
        toast.error(
          err.data?.code === "UNAUTHORIZED"
            ? "ログインが必要です。"
            : "Todoの作成に失敗しました。",
        );
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      title: "",
    },
    validators: {
      onSubmit: CreateTodoSchema,
    },
    onSubmit: (data) => createTodo.mutate(data.value),
  });

  const handleSubmitForm = () => {
    void form.handleSubmit();
  };

  return (
    <form.Field name="title">
      {(field) => {
        const isInvalid = !field.state.meta.isValid;
        return (
          <Field className="gap-2">
            <View className="flex-row gap-2">
              <Input
                value={field.state.value}
                placeholder="今日は何をしますか？"
                autoComplete="off"
                accessibilityLabel="Todo"
                returnKeyType="done"
                invalid={isInvalid}
                editable={!createTodo.isPending}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                onSubmitEditing={handleSubmitForm}
                className="h-11 flex-1"
              />
              <Button
                disabled={createTodo.isPending}
                onPress={handleSubmitForm}
                className="h-11 px-5"
              >
                {createTodo.isPending ? "登録中…" : "登録"}
              </Button>
            </View>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}
