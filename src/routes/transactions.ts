import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";

import type { Env } from "@/index";
import {
  InsertTransactionSchema,
  transactions,
  users,
} from "@/database/schema";
import { zValidator } from "@hono/zod-validator";

import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { z } from "zod";

const app = new Hono<{ Bindings: Env }>()
  .get(
    "/:email",
    zValidator("param", z.object({ email: z.string().email() })),
    async (c) => {
      const database = drizzle(c.env.DB);
      const { email } = c.req.valid("param");

      if (!email) {
        return c.json({ message: "No email provided" }, 400);
      }

      const [user] = await database
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        return c.json({ message: "User not found" }, 404);
      }

      const data = await database
        .select()
        .from(transactions)
        .where(eq(transactions.userEmail, user.email));

      if (data.length === 0) {
        return c.json({ message: "No transactions found", data: [] }, 404);
      }

      return c.json({ data });
    }
  )
  .post("/", zValidator("json", InsertTransactionSchema), async (c) => {
    const database = drizzle(c.env.DB);
    const values = c.req.valid("json");

    const isExpense = values.type === "expense";

    const data = await database
      .insert(transactions)
      .values({
        ...values,
        id: uuidv4(),
        amount: isExpense ? -values.amount : values.amount,
      })
      .returning();

    return c.json({ data });
  })
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const database = drizzle(c.env.DB);
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ message: "No ID provided" }, 400);
      }

      const data = await database
        .delete(transactions)
        .where(eq(transactions.id, id))
        .returning();

      if (data.length === 0) {
        return c.json({ message: "Transaction not found" }, 404);
      }

      return c.json({ message: "Transaction deleted" });
    }
  )
  .patch(
    "/:id",
    zValidator("json", InsertTransactionSchema),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const database = drizzle(c.env.DB);
      const values = c.req.valid("json");
      const { id } = c.req.param();

      if (!id) {
        return c.json({ message: "No ID provided" }, 400);
      }

      const data = await database
        .update(transactions)
        .set(values)
        .where(eq(transactions.id, id))
        .returning();

      return c.json({ data });
    }
  );

export default app;
