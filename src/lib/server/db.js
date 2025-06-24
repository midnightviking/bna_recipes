// Drizzle ORM DB abstraction: Cloudflare D1 only
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from './schema.js';

// Only Cloudflare D1 is supported now
const dbInstance = (env) => drizzleD1(env.DB, { schema });

export default dbInstance;