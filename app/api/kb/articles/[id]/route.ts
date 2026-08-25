import { NextResponse } from "next/server";
import { getArticleById } from "@/lib/db/kb";

export async function GET(req: Request, ctx: RouteContext<"/api/kb/articles/[id]">) {
  try {
    const { id } = await ctx.params;
    const article = await getArticleById(id);
    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(article);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
