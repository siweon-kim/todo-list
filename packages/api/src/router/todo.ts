import type { TRPCRouterRecord } from "@trpc/server";
import z4 from "zod/v4";

import { desc, eq, sql } from "@acme/db";
import { Todo } from "@acme/db/schema";
import { CreateTodoSchema } from "@acme/db/validators";

import { publicProcedure } from "../trpc";

export const todoRouter = {
  all: publicProcedure //
    .query(({ ctx }) => {
      return ctx.db.query.Todo.findMany({
        orderBy: desc(Todo.createdAt),
      });
    }),

  create: publicProcedure //
    .input(CreateTodoSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Todo).values(input);
    }),

  toggle: publicProcedure //
    .input(z4.string())
    .mutation(({ ctx, input }) => {
      const result = ctx.db //
        .update(Todo)
        .set({ completed: sql`NOT ${Todo.completed}` })
        .where(eq(Todo.id, input));

      console.log(result);

      //   if (getAffectedRows(result) === 0) {
      //     throw new TRPCError({ code: "NOT_FOUND" });
      //   }
    }),

  delete: publicProcedure //
    .input(z4.string())
    .mutation(({ ctx, input }) => {
      return ctx.db.delete(Todo).where(eq(Todo.id, input));
    }),
} satisfies TRPCRouterRecord;
