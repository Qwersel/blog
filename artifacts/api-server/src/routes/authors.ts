import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  authorsTable,
  insertAuthorSchema,
  updateAuthorSchema,
} from "@workspace/db";

const router: IRouter = Router();

const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/authors", async (req, res): Promise<void> => {
  const authors = await db.select().from(authorsTable);
  res.json(authors);
});

router.post("/authors", async (req, res): Promise<void> => {
  const parsed = insertAuthorSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [author] = await db
    .insert(authorsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(author);
});

router.get("/authors/:id", async (req, res): Promise<void> => {
  const params = IdParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [author] = await db
    .select()
    .from(authorsTable)
    .where(eq(authorsTable.id, params.data.id));
  if (!author) {
    res.status(404).json({ error: "Author not found" });
    return;
  }
  res.json(author);
});

router.put("/authors/:id", async (req, res): Promise<void> => {
  const params = IdParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = updateAuthorSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [author] = await db
    .update(authorsTable)
    .set(parsed.data)
    .where(eq(authorsTable.id, params.data.id))
    .returning();
  if (!author) {
    res.status(404).json({ error: "Author not found" });
    return;
  }
  res.json(author);
});

router.delete("/authors/:id", async (req, res): Promise<void> => {
  const params = IdParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [author] = await db
    .delete(authorsTable)
    .where(eq(authorsTable.id, params.data.id))
    .returning();
  if (!author) {
    res.status(404).json({ error: "Author not found" });
    return;
  }
  res.json(author);
});

export default router;
