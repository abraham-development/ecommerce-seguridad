import { Pool } from "pg";
import { databaseSchemaSql } from "@/lib/db-schema";

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not configured");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new DatabaseNotConfiguredError();
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes("sslmode=disable")
        ? false
        : { rejectUnauthorized: false },
      max: 5,
    });
  }

  return pool;
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool().query(databaseSchemaSql).then(() => undefined);
  }

  await schemaReady;
}

export async function query<T>(
  text: string,
  values: readonly unknown[] = []
): Promise<T[]> {
  await ensureSchema();
  const result = await getPool().query(text, [...values]);
  return result.rows as T[];
}

export async function queryOne<T>(
  text: string,
  values: readonly unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, values);
  return rows[0] ?? null;
}

export async function transaction<T>(
  callback: (client: {
    query: <R>(
      text: string,
      values?: readonly unknown[]
    ) => Promise<R[]>;
  }) => Promise<T>
): Promise<T> {
  await ensureSchema();
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const result = await callback({
      query: async <R>(
        text: string,
        values: readonly unknown[] = []
      ) => {
        const response = await client.query(text, [...values]);
        return response.rows as R[];
      },
    });
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
