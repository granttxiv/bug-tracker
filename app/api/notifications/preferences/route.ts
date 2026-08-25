import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import type { AuthenticatedRequest } from "@/lib/auth/middleware";
import { getPreferences, updatePreferences, createPreferences } from "@/lib/db/notifications";

export const GET = withAuth(async (req: AuthenticatedRequest, _ctx) => {
  try {
    let prefs = await getPreferences(req.user!.userId);
    if (!prefs) {
      prefs = await createPreferences(req.user!.userId);
    }
    return NextResponse.json(prefs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
});

export const PATCH = withAuth(async (req: AuthenticatedRequest, _ctx) => {
  try {
    const body = await req.json();
    const prefs = await updatePreferences(req.user!.userId, body);
    if (!prefs) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(prefs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
});
