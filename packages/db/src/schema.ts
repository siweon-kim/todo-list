import { mysqlTable } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const Post = mysqlTable("post", (t) => ({
  id: t
    .varchar({ length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp().defaultNow().onUpdateNow(),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 내가 추가

export const Todo = mysqlTable("todo", (t) => ({
  id: t
    .varchar({ length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: t.varchar({ length: 256 }).notNull(),
  completed: t.boolean().default(false),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp().defaultNow().onUpdateNow(),
}));

export const CreateTodoSchema = createInsertSchema(Todo, {
  title: z.string().max(256),
}).omit({
  id: true,
  completed: true,
  createdAt: true,
  updatedAt: true,
});

export * from "./auth-schema";
