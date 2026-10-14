import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { todoRouter } from "./router/todo";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  todo: todoRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
