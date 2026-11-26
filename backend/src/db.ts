import pg from 'pg';
import { config } from './config.js';

// BIGINT (price) -> JS number; prices in INR fit comfortably.
pg.types.setTypeParser(20, (v) => Number(v));

export const pool = new pg.Pool({ connectionString: config.databaseUrl });

export async function query<T extends pg.QueryResultRow = any>(text: string, params: unknown[] = []) {
  return pool.query<T>(text, params);
}
