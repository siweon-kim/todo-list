import type { ErrorBoundaryProps } from "expo-router";
import { Suspense, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";

import CreateTodoForm from "~/components/todo/CreateTodoForm";
import TodoCardSkeleton from "~/components/todo/TodoCardSkeleton";
import TodoList from "~/components/todo/TodoList";
import { Button } from "~/components/ui/button";
import { authClient } from "~/utils/auth";

function TodoHeader() {
  return (
    <View className="mb-8">
      <Text className="text-foreground text-4xl font-extrabold tracking-tight">
        My <Text className="text-primary">Todo</Text>
      </Text>
      <Text className="text-muted-foreground mt-2 text-sm">
        今日のやることを整理しましょう。
      </Text>
    </View>
  );
}

export default function TodoListPage() {
  const { data: session, isPending } = authClient.useSession();

  // 削除アクションを表示中のTodo（カード外をタップすると閉じる）
  const [openTodoId, setOpenTodoId] = useState<string | null>(null);

  if (isPending) return null;
  if (!session) return <Redirect href="/" />;

  const closeAction = () => setOpenTodoId(null);

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={closeAction}
        contentContainerClassName="grow px-8 py-16"
      >
        <Pressable
          accessible={false}
          onPress={closeAction}
          className="mx-auto w-full max-w-2xl grow"
        >
          <TodoHeader />

          <View className="mb-6">
            <CreateTodoForm />
          </View>

          <Suspense
            fallback={
              <View className="flex w-full flex-col gap-3">
                <TodoCardSkeleton />
                <TodoCardSkeleton />
                <TodoCardSkeleton pulse={false} />
              </View>
            }
          >
            <TodoList
              openTodoId={openTodoId}
              onToggleAction={(todoId) =>
                setOpenTodoId((prev) => (prev === todoId ? null : todoId))
              }
            />
          </Suspense>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaView className="bg-background flex-1">
      <View className="mx-auto w-full max-w-2xl grow px-8 py-16">
        <TodoHeader />
        <View className="border-muted-foreground/30 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed py-16">
          <Text className="text-foreground text-center text-lg font-semibold">
            読み込みに失敗しました
          </Text>
          <Button variant="outline" onPress={() => void retry()}>
            再試行
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
