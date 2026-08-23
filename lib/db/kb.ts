import { db } from "./client";
import { kbArticles, NewKBArticle } from "./schema";
import { eq, and, ilike, or } from "drizzle-orm";

export async function createKBArticle(data: NewKBArticle) {
  const [article] = await db.insert(kbArticles).values(data).returning();
  return article;
}

export async function getPublishedArticles(category?: string, limit = 20, offset = 0) {
  const conditions = [eq(kbArticles.published, true)];
  if (category) conditions.push(eq(kbArticles.category, category));

  return db
    .select()
    .from(kbArticles)
    .where(and(...conditions))
    .orderBy(kbArticles.createdAt)
    .limit(limit)
    .offset(offset);
}

export async function searchArticles(query: string, limit = 10) {
  // Search in title, content, tags
  return db
    .select()
    .from(kbArticles)
    .where(
      and(
        eq(kbArticles.published, true),
        or(
          ilike(kbArticles.title, `%${query}%`),
          ilike(kbArticles.content, `%${query}%`),
          ilike(kbArticles.tags, `%${query}%`),
        ),
      ),
    )
    .limit(limit);
}

export async function getArticleById(id: string) {
  const [article] = await db.select().from(kbArticles).where(eq(kbArticles.id, id));
  if (article) {
    // Increment view count
    await db
      .update(kbArticles)
      .set({ viewCount: article.viewCount + 1 })
      .where(eq(kbArticles.id, id));
  }
  return article || null;
}

export async function getArticleBySlug(slug: string) {
  const [article] = await db.select().from(kbArticles).where(eq(kbArticles.slug, slug));
  return article || null;
}

export async function updateKBArticle(id: string, data: Partial<NewKBArticle>) {
  const [updated] = await db
    .update(kbArticles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(kbArticles.id, id))
    .returning();
  return updated || null;
}

export async function deleteKBArticle(id: string) {
  await db.delete(kbArticles).where(eq(kbArticles.id, id));
}
