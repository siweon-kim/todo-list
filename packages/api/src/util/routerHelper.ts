import type { MySqlRawQueryResult } from "@acme/db";

export const getAffectedRows = (result: MySqlRawQueryResult): number =>
  result[0].affectedRows;
