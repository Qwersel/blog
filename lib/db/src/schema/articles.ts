import { date, integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { authorsTable } from "./authors";

export const articlesTable = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  publishedDate: date("published_date", { mode: "string" }),
  authorId: integer("author_id")
    .notNull()
    .references(() => authorsTable.id),
});

export const insertArticleSchema = createInsertSchema(articlesTable).omit({ id: true });
export const updateArticleSchema = insertArticleSchema.partial();
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articlesTable.$inferSelect;
