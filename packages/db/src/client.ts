import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as schema from "./schema";

const url = process.env.DB_URL;

if (!url) throw new Error("Missing DB_URL");

const pool = mysql.createPool(url);

export const db = drizzle({
  client: pool,
  schema,
  mode: "default",
  casing: "snake_case",
});
