import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";

import type { Env } from "@/index";
import { InsertUserSchema, users } from "@/database/schema";
import { zValidator } from "@hono/zod-validator";

import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { eq } from "drizzle-orm";

const app = new Hono<{ Bindings: Env }>()
  .post(
    "/",
    zValidator("json", InsertUserSchema.omit({ id: true })),
    async (c) => {
      const database = drizzle(c.env.DB);
      const values = c.req.valid("json");

      const data = await database
        .insert(users)
        .values({
          ...values,
          id: uuidv4(),
        })
        .returning();

      return c.json({ data });
    }
  )
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

      return c.json({ data: user });
    }
  );

export default app;
