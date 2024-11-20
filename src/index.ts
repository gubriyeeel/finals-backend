import { Hono } from "hono";

import { logger } from "hono/logger";

import users from "@/routes/users";
import transactions from "@/routes/transactions";

export type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.use(logger());

app.route("/transactions", transactions).route("/users", users);

export default app;
