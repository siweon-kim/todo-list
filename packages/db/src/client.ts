import { drizzle } from "drizzle-orm/vercel-postgres";
import mysql from "mysql2/promise";

import * as schema from "./schema";

const pool = mysql.createPool(process.env.DB_URL!);

export const db = drizzle({
  client: pool,
  schema,
  casing: "snake_case",
});
