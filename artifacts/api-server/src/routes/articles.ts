import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  authorsTable,
  articlesTable,
  insertArticleSchema,
  updateArticleSchema,
} from "@workspace/db";

const router: IRouter = Router();

const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/articles", async (req, res): Promise<void> => {
  const articles = await db.select().from(articlesTable);
  res.json(articles);
});

router.post("/articles", async (req, res): Promise<void> => {
  const parsed = insertArticleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  // Verify the referenced author exists
  const [author] = await db
    .select({ id: authorsTable.id })
    .from(authorsTable)
    .where(eq(authorsTable.id, parsed.data.authorId));
  if (!author) {
    res.status(404).json({ error: "Author not found" });
    return;
  }
  const [article] = await db
    .insert(articlesTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(article);
});

router.get("/articles/:id", async (req, res): Promise<void> => {
  const params = IdParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [article] = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.id, params.data.id));
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(article);
});

router.put("/articles/:id", async (req, res): Promise<void> => {
  const params = IdParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = updateArticleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  // If authorId is being updated, verify the new author exists
  if (parsed.data.authorId !== undefined) {
    const [author] = await db
      .select({ id: authorsTable.id })
      .from(authorsTable)
      .where(eq(authorsTable.id, parsed.data.authorId));
    if (!author) {
      res.status(404).json({ error: "Author not found" });
      return;
    }
  }
  const [article] = await db
    .update(articlesTable)
    .set(parsed.data)
    .where(eq(articlesTable.id, params.data.id))
    .returning();
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(article);
});

router.delete("/articles/:id", async (req, res): Promise<void> => {
  const params = IdParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [article] = await db
    .delete(articlesTable)
    .where(eq(articlesTable.id, params.data.id))
    .returning();
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(article);
});

export default router;
