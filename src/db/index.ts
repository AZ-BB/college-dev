import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema/schema"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Supabase DB connection string
})

export const db = drizzle(pool, { schema })