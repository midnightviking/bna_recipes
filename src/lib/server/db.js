// Drizzle ORM DB abstraction: uses better-sqlite3 locally, Cloudflare D1 in production
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleD1 } from 'drizzle-orm/cloudflare-d1';
import * as schema from './schema.js';

const useD1 = process.env.USE_D1 === 'true' || process.env.NODE_ENV === 'production';

let dbInstance;

if (!useD1) {
  // Local development: better-sqlite3
  const Database = (await import('better-sqlite3')).default;
  const sqlite = new Database('app.db', { verbose: console.log });
  sqlite.pragma('journal_mode = WAL');
  dbInstance = drizzleSqlite(sqlite, { schema });
} else {
  // Production: Cloudflare D1
  dbInstance = (env) => drizzleD1(env.DB, { schema });
}

export default dbInstance;