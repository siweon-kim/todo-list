import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import CreateTodoForm from "../_components/todo/CreateTodoForm";
import TodoCardSkeleton from "../_components/todo/TodoCardSkeleton";
import TodoList from "../_components/todo/TodoList";

export default async function TodoListPage() {
  const session = await getSession();
  if (!session) redirect("/");

  prefetch(trpc.todo.all.queryOptions());

  // クライアントサイドでhttp通信を通してデータを持ち込む
  // trpc.todo.all.queryOptions();

  return (
    <HydrateClient>
      <main className="container min-h-screen py-16">
        <div className="mx-auto w-full max-w-2xl">
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight">
              My <span className="text-primary">Todo</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              今日のやることを整理しましょう。
            </p>
          </header>

          <div className="mb-6">
            <CreateTodoForm />
          </div>

          <div>
            <Suspense
              fallback={
                <div className="flex w-full flex-col gap-3">
                  <TodoCardSkeleton />
                  <TodoCardSkeleton />
                  <TodoCardSkeleton pulse={false} />
                </div>
              }
            >
              <TodoList />
            </Suspense>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
