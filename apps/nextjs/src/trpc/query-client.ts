import type { DefaultError } from "@tanstack/react-query";
import {
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
        retry: (failureCount, err) => {
          if (err.message === "UNAUTHORIZED") return false;

          return failureCount < 3;
        },
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        shouldRedactErrors: () => {
          // We should not catch Next.js server errors
          // as that's how Next.js detects dynamic pages
          // so we cannot redact them.
          // Next.js also automatically redacts errors for us
          // with better digests.
          return false;
        },
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
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

const handleAuthError = (err: DefaultError) => {
  if (typeof window === "undefined") return;
  if (err.message === "UNAUTHORIZED") window.location.href = "/";
};
