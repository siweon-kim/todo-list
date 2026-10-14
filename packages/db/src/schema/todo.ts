import { mysqlTable } from "drizzle-orm/mysql-core";

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
