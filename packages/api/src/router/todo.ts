import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import z4 from "zod/v4";

import { and, desc, eq, sql } from "@acme/db";
import { Todo } from "@acme/db/schema";
import { CreateTodoSchema } from "@acme/db/validators";

import { protectedProcedure } from "../trpc";
import { getAffectedRows } from "../util/routerHelper";

export const todoRouter = {
  all: protectedProcedure //
    .query(({ ctx }) => {
      const userId = ctx.session.user.id;

      return ctx.db.query.Todo.findMany({
        where: eq(Todo.userId, userId),
        orderBy: desc(Todo.createdAt),
      });
    }),

  create: protectedProcedure //
    .input(CreateTodoSchema)
    .mutation(({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.insert(Todo).values({ ...input, userId });
    }),

  toggle: protectedProcedure //
    .input(z4.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.db //
        .update(Todo)
        .set({ completed: sql`NOT ${Todo.completed}` })
        .where(and(eq(Todo.id, input), eq(Todo.userId, userId)));

      if (getAffectedRows(result) === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }),

  delete: protectedProcedure //
    .input(z4.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.db //
        .delete(Todo)
        .where(and(eq(Todo.id, input), eq(Todo.userId, userId)));

      if (getAffectedRows(result) === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }),
} satisfies TRPCRouterRecord;
