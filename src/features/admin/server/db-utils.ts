import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __portfolioSqlClient: ReturnType<typeof postgres> | undefined;
  var __portfolioDb: ReturnType<typeof drizzle> | undefined;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function initializeDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!global.__portfolioSqlClient) {
    global.__portfolioSqlClient = postgres(process.env.DATABASE_URL!, {
      prepare: false,
    });
  }

  if (!global.__portfolioDb) {
    global.__portfolioDb = drizzle(global.__portfolioSqlClient, { schema });
  }

  return global.__portfolioDb;
}
