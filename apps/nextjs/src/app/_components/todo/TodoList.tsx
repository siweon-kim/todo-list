"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import TodoCard from "./TodoCard";

export default function TodoList() {
  const trpc = useTRPC();
  const { data: todos } = useSuspenseQuery(trpc.todo.all.queryOptions());

  if (!todos.length)
    return (
      <div className="border-muted-foreground/30 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center">
        <p className="text-lg font-semibold">やることはありません</p>
        <p className="text-muted-foreground mt-1 text-sm">
          新しいやることを追加しましょう。
        </p>
      </div>
    );

  return (
    <div className="flex w-full flex-col gap-3">
      {todos.map((todo) => {
        return <TodoCard key={todo.id} todo={todo} />;
      })}
    </div>
  );
}
