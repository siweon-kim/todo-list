import type { Config } from "drizzle-kit";

if (!process.env.DB_URL) {
  throw new Error("Missing DB_URL");
}

const nonPoolingUrl = process.env.DB_URL;

export default {
  schema: "./src/schema.ts",
  dialect: "mysql",
  dbCredentials: { url: nonPoolingUrl },
  casing: "snake_case",
} satisfies Config;
