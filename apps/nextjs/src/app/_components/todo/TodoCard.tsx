"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RouterOutputs } from "@acme/api";
import { cn } from "@acme/ui";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";

interface TodoCardProps {
  todo: RouterOutputs["todo"]["all"][number];
}

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Tokyo",
});

export default function TodoCard({ todo }: TodoCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const cardRef = useRef<HTMLDivElement>(null);
  const [isActionOpen, setIsActionOpen] = useState(false);

  useEffect(() => {
    if (!isActionOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!cardRef.current?.contains(e.target as Node)) setIsActionOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isActionOpen]);

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
    <div
      ref={cardRef}
      onClick={() => setIsActionOpen((prev) => !prev)}
      className={cn(
        "bg-muted relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-lg border border-transparent p-4 transition-colors select-none",
        "hover:border-primary/40",
        isActionOpen && "border-destructive/40 hover:border-destructive/40",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-xs",
          todo.completed && "opacity-60",
          todo.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/50",
        )}
        onClick={(e) => {
          e.stopPropagation();
          toggleComplited.mutate(todo.id);
        }}
      >
        {todo.completed && "✓"}
      </span>
      <div className={cn("min-w-0 grow", todo.completed && "opacity-60")}>
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
          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity duration-300",
          isActionOpen && "opacity-0",
          todo.completed
            ? "bg-primary/15 text-primary"
            : "bg-background text-muted-foreground",
        )}
      >
        {todo.completed ? "完了" : "未完了"}
      </span>

      <div
        aria-hidden={!isActionOpen}
        className={cn(
          "absolute inset-y-0 right-0 flex w-40 items-center justify-end pr-4",
          "from-destructive via-destructive/60 bg-linear-to-l to-transparent",
          "transition-all duration-300 ease-out",
          isActionOpen
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-full opacity-0",
        )}
      >
        <button
          type="button"
          aria-label="削除"
          tabIndex={isActionOpen ? 0 : -1}
          onClick={(e) => {
            e.stopPropagation();
            deleteTodo.mutate(todo.id);
          }}
          className={cn(
            "text-destructive-foreground flex size-9 items-center justify-center rounded-full",
            "transition-transform duration-300 hover:scale-110 hover:bg-white/20 active:scale-95",
            "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none",
            isActionOpen ? "scale-100 delay-100" : "scale-50",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
