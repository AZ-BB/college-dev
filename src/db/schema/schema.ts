import { pgTable, foreignKey, unique, pgPolicy, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const roles = pgEnum("roles", ['USER', 'ADMIN'])


export const users = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	email: text().notNull(),
	avatarUrl: text("avatar_url"),
	role: roles().default('USER').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [table.id],
			name: "users_id_fkey"
		}),
	unique("users_email_key").on(table.email),
	pgPolicy("Public users are viewable by everyone", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("Users can update their own profile", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Users can insert their own profile", { as: "permissive", for: "insert", to: ["public"] }),
]);
