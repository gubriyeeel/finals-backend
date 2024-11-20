import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  date: text("date")
    .notNull()
    .default(sql`(current_timestamp)`),
  account: text("account").notNull(),
  category: text("category").notNull(),
  userEmail: text("userEmail")
    .notNull()
    .references(() => users.email, {
      onDelete: "cascade",
    }),
  type: text("type").notNull(),
});

export const InsertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date(),
}).omit({
  date: true,
  id: true,
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
});

export const InsertUserSchema = createInsertSchema(users);
