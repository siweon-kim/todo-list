import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RouterOutputs } from "~/utils/api";
import { toast } from "~/components/ui/toast";
import { trpc } from "~/utils/api";
import { cn } from "~/utils/cn";

interface TodoCardProps {
  todo: RouterOutputs["todo"]["all"][number];
  isActionOpen: boolean;
  onPress: () => void;
}

const ACTION_WIDTH = 160;
// `bg-linear-to-l from-destructive via-destructive/60 to-transparent`を帯の重ね合わせで再現
const GRADIENT_STEPS = Array.from({ length: 16 }, (_, i) => {
  const x = (i + 0.5) / 16;
  return x < 0.5 ? x * 1.2 : 0.6 + (x - 0.5) * 0.8;
});

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Tokyo",
});

function TrashIcon() {
  return (
    <View className="h-5 w-5 items-center justify-center">
      <View className="border-destructive-foreground h-[3px] w-[7px] rounded-t-sm border-2 border-b-0" />
      <View className="bg-destructive-foreground h-0.5 w-[15px] rounded-full" />
      <View className="border-destructive-foreground h-[12px] w-[12px] flex-row items-center justify-center gap-[3px] rounded-b-sm border-2 border-t-0">
        <View className="bg-destructive-foreground h-[5px] w-0.5 rounded-full" />
        <View className="bg-destructive-foreground h-[5px] w-0.5 rounded-full" />
      </View>
    </View>
  );
}

export default function TodoCard({
  todo,
  isActionOpen,
  onPress,
}: TodoCardProps) {
  const queryClient = useQueryClient();

  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isActionOpen ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isActionOpen, progress]);

  const toggleComplited = useMutation(
    trpc.todo.toggle.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.todo.all.queryFilter());
      },

      onError: async (err) => {
        switch (err.data?.code) {
          case "BAD_REQUEST":
            toast.error(err.data.code);
            console.error(err.message);
            break;

          case "UNAUTHORIZED":
            toast.error("ログインが必要です。");
            break;

          case "NOT_FOUND":
            toast.error("データが見付かれません。");
            await queryClient.invalidateQueries(trpc.todo.pathFilter());
            break;

          default:
            toast.error("作成に失敗しました。");
        }
      },
    }),
  );

  const deleteTodo = useMutation(
    trpc.todo.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("成功的に削除しました。");
        await queryClient.invalidateQueries(trpc.todo.all.queryFilter());
      },

      onError: async (err) => {
        switch (err.data?.code) {
          case "BAD_REQUEST":
            toast.error(err.data.code);
            console.error(err.message);
            break;

          case "UNAUTHORIZED":
            toast.error("ログインが必要です。");
            break;

          case "NOT_FOUND":
            toast.error("データが見付かれません。");
            await queryClient.invalidateQueries(trpc.todo.pathFilter());
            break;

          default:
            toast.error("削除に失敗しました。");
        }
      },
    }),
  );

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "bg-muted relative flex-row items-center gap-4 overflow-hidden rounded-lg border p-4",
        isActionOpen
          ? "border-destructive/40"
          : "active:border-primary/40 border-transparent",
      )}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!todo.completed }}
        hitSlop={8}
        onPress={() => toggleComplited.mutate(todo.id)}
        className={cn(
          "size-5 shrink-0 items-center justify-center rounded-full border-2",
          todo.completed
            ? "border-primary bg-primary opacity-60"
            : "border-muted-foreground/50",
        )}
      >
        {todo.completed && (
          <Text className="text-primary-foreground text-xs">✓</Text>
        )}
      </Pressable>
      <View className={cn("min-w-0 flex-1", todo.completed && "opacity-60")}>
        <Text
          numberOfLines={1}
          className={cn(
            "text-lg font-semibold",
            todo.completed
              ? "text-muted-foreground line-through"
              : "text-foreground",
          )}
        >
          {todo.title}
        </Text>
        <Text className="text-muted-foreground mt-1 text-xs">
          {dateFormatter.format(todo.createdAt)}
        </Text>
      </View>
      {/* classNameとstyleを同じ要素に指定するとclassNameが無視されるため、
          アニメーション(style)とスタイル(className)は別の要素に分ける */}
      <Animated.View
        style={{
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        }}
      >
        <View
          className={cn(
            "rounded-full px-2.5 py-0.5",
            todo.completed ? "bg-primary/15" : "bg-background",
          )}
        >
          <Text
            className={cn(
              "text-xs font-medium",
              todo.completed ? "text-primary" : "text-muted-foreground",
            )}
          >
            {todo.completed ? "完了" : "未完了"}
          </Text>
        </View>
      </Animated.View>

      <View
        aria-hidden={!isActionOpen}
        pointerEvents={isActionOpen ? "box-none" : "none"}
        className="absolute inset-y-0 right-0 w-40"
      >
        <Animated.View
          pointerEvents="box-none"
          style={{
            flex: 1,
            opacity: progress,
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [ACTION_WIDTH, 0],
                }),
              },
            ],
          }}
        >
          <View pointerEvents="none" className="absolute inset-0 flex-row">
            {GRADIENT_STEPS.map((opacity, i) => (
              <View key={i} style={{ flex: 1, opacity }}>
                <View className="bg-destructive flex-1" />
              </View>
            ))}
          </View>
          <View
            pointerEvents="box-none"
            className="flex-1 flex-row items-center justify-end pr-4"
          >
            <Animated.View
              style={{
                transform: [
                  {
                    scale: progress.interpolate({
                      inputRange: [0, 0.33, 1],
                      outputRange: [0.5, 0.5, 1],
                    }),
                  },
                ],
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="削除"
                disabled={!isActionOpen || deleteTodo.isPending}
                onPress={() => deleteTodo.mutate(todo.id)}
                className="size-9 items-center justify-center rounded-full active:bg-white/20"
              >
                <TrashIcon />
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
}
