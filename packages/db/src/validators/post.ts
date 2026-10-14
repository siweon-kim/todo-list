import { createInsertSchema } from "drizzle-zod";
import z from "zod/v4";

import { Post } from "../schema/post";

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
