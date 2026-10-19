import { Text, View } from "react-native";
import { useSuspenseQuery } from "@tanstack/react-query";

import { trpc } from "~/utils/api";
import TodoCard from "./TodoCard";

interface TodoListProps {
  openTodoId: string | null;
  onToggleAction: (todoId: string) => void;
}

export default function TodoList({
  openTodoId,
  onToggleAction,
}: TodoListProps) {
  const { data: todos } = useSuspenseQuery(trpc.todo.all.queryOptions());

  if (!todos.length)
    return (
      <View className="border-muted-foreground/30 flex-col items-center justify-center rounded-lg border-2 border-dashed py-16">
        <Text className="text-foreground text-center text-lg font-semibold">
          やることはありません
        </Text>
        <Text className="text-muted-foreground mt-1 text-center text-sm">
          新しいやることを追加しましょう。
        </Text>
      </View>
    );

  return (
    <View className="flex w-full flex-col gap-3">
      {todos.map((todo) => {
        return (
          <TodoCard
            key={todo.id}
            todo={todo}
            isActionOpen={openTodoId === todo.id}
            onPress={() => onToggleAction(todo.id)}
          />
        );
      })}
    </View>
  );
}
