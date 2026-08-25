import { NextResponse } from "next/server";
import { withRole } from "@/lib/auth/middleware";
import type { AuthenticatedRequest } from "@/lib/auth/middleware";
import { createKBArticle } from "@/lib/db/kb";

export const POST = withRole(["admin"])(async (req: AuthenticatedRequest, _ctx) => {
  try {
    const body = await req.json();

    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const article = await createKBArticle({
      title: body.title,
      slug: body.slug,
      content: body.content,
      category: body.category,
      tags: body.tags,
      published: body.published || false,
      createdBy: req.user!.userId,
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
});
