import { mysqlTable } from "drizzle-orm/mysql-core";

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
