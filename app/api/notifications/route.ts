import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import type { AuthenticatedRequest } from "@/lib/auth/middleware";
import { getUserNotifications } from "@/lib/db/notifications";

export const GET = withAuth(async (req: AuthenticatedRequest, _ctx) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const notifs = await getUserNotifications(req.user!.userId, limit, offset);
    return NextResponse.json(notifs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
});
