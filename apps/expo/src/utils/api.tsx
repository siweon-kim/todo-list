import type { DefaultError } from "@tanstack/react-query";
import { router } from "expo-router";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";

import type { AppRouter } from "@acme/api";

import { authClient } from "./auth";
import { getBaseUrl } from "./base-url";

// セッションが無効になった場合は端末のセッションを破棄してログイン画面へ移動
const handleAuthError = (err: DefaultError) => {
  if (err.message !== "UNAUTHORIZED") return;

  void authClient.signOut().finally(() => {
    queryClient.clear();
    router.replace("/");
  });
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: (failureCount, err) => {
        if (err.message === "UNAUTHORIZED") return false;

        return failureCount < 3;
      },
    },
  },

  queryCache: new QueryCache({
    onError: (err) => {
      handleAuthError(err);
    },
  }),
  mutationCache: new MutationCache({
    onError: (err) => {
      handleAuthError(err);
    },
  }),
});

/**
 * A set of typesafe hooks for consuming your API.
 */
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
        colorMode: "ansi",
      }),
      httpBatchLink({
        transformer: superjson,
        url: `${getBaseUrl()}/api/trpc`,
        headers() {
          const headers = new Map<string, string>();
          headers.set("x-trpc-source", "expo-react");

          const cookies = authClient.getCookie();
          if (cookies) {
            headers.set("Cookie", cookies);
          }
          return headers;
        },
      }),
    ],
  }),
  queryClient,
});

export type { RouterInputs, RouterOutputs } from "@acme/api";
