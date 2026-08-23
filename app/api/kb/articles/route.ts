import { NextResponse } from "next/server";
import { getPublishedArticles, searchArticles } from "@/lib/db/kb";

/**
 * @dev this might be moved into a /search route in the future, but for now it's here to support the search functionality in the KB.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let articles;
    if (q) {
      articles = await searchArticles(q, limit);
    } else {
      articles = await getPublishedArticles(category || undefined, limit, offset);
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
