"use client";

import type { RouterOutputs } from "@acme/api";
import { cn } from "@acme/ui";

interface TodoCardProps {
  todo: RouterOutputs["todo"]["all"][number];
}

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Tokyo",
});

export default function TodoCard({ todo }: TodoCardProps) {
  // const trpc =useTRPc();
  // const queryClient = useQueryClient();

  return (
    <div
      className={cn(
        "bg-muted flex items-center gap-4 rounded-lg border border-transparent p-4 transition-colors",
        "hover:border-primary/40",
        todo.completed && "opacity-60",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-xs",
          todo.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/50",
        )}
      >
        {todo.completed && "✓"}
      </span>
      <div className="min-w-0 grow">
        <h2
          className={cn(
            "truncate text-lg font-semibold",
            todo.completed && "text-muted-foreground line-through",
          )}
        >
          {todo.title}
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          {dateFormatter.format(todo.createdAt)}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
          todo.completed
            ? "bg-primary/15 text-primary"
            : "bg-background text-muted-foreground",
        )}
      >
        {todo.completed ? "完了" : "未完了"}
      </span>
    </div>
  );
}
