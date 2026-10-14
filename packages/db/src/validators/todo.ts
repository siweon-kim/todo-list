import { createInsertSchema } from "drizzle-zod";
import z4 from "zod/v4";

import { Todo } from "../schema";

export const CreateTodoSchema = createInsertSchema(Todo, {
  title: z4.string().max(10),
}).omit({
  id: true,
  completed: true,
  createdAt: true,
  updatedAt: true,
});
