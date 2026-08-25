import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import type { AuthenticatedRequest } from "@/lib/auth/middleware";
import { markAsRead } from "@/lib/db/notifications";

export const PATCH = withAuth<"/api/notifications/[id]">(async (req: AuthenticatedRequest, ctx) => {
  try {
    const { id } = await ctx.params;
    const notif = await markAsRead(id);
    if (!notif) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(notif);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
});
