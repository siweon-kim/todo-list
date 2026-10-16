import { index, mysqlTable } from "drizzle-orm/mysql-core";

import { user } from "./auth-schema";

export const Todo = mysqlTable(
  "todo",
  (t) => ({
    id: t
      .varchar({ length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: t.varchar({ length: 256 }).notNull(),
    completed: t.boolean().default(false),
    userId: t
      .varchar({ length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().defaultNow().onUpdateNow(),
  }),
  (table) => [index("todo_userId_idx").on(table.userId)],
);
