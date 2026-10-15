"use client";

import type { FormEventHandler } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateTodoSchema } from "@acme/db/validators";
import { Button } from "@acme/ui/button";
import { Field, FieldError, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";

export default function CreateTodoForm() {
  const trpc = useTRPC();
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

  const handleSubmitForm: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmitForm}>
      <form.Field name="title">
        {(field) => {
          const isInvalid = !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid} className="gap-2">
              <FieldLabel htmlFor={field.name} className="sr-only">
                Todo
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  placeholder="今日は何をしますか？"
                  autoComplete="off"
                  aria-invalid={isInvalid}
                  disabled={createTodo.isPending}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-11 grow"
                />
                <Button
                  type="submit"
                  disabled={createTodo.isPending}
                  className="h-11 shrink-0 px-5"
                >
                  {createTodo.isPending ? "登録中…" : "登録"}
                </Button>
              </div>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>
    </form>
  );
}
