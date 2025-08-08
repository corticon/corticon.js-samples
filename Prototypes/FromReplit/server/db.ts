import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use standard PostgreSQL connection for local development
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Additional options for local PostgreSQL
  ssl: false // Disable SSL for local development
});

export const db = drizzle(pool, { schema });