import { NextResponse } from "next/server";
import { withRole } from "@/lib/auth/middleware";
import type { AuthenticatedRequest } from "@/lib/auth/middleware";
import { updateKBArticle, deleteKBArticle } from "@/lib/db/kb";

export const PATCH = withRole<"/api/admin/kb/[id]">(
  ["admin"],
  async (req: AuthenticatedRequest, ctx) => {
    try {
      const { id } = await ctx.params;
      const body = await req.json();
      const article = await updateKBArticle(id, body);
      if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(article);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
  },
);

export const DELETE = withRole<"/api/admin/kb/[id]">(
  ["admin"],
  async (req: AuthenticatedRequest, ctx) => {
    try {
      const { id } = await ctx.params;
      await deleteKBArticle(id);
      return NextResponse.json({ message: "Deleted" });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
  },
);
