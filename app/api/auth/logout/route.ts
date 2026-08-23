import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";

async function handler(_req: AuthenticatedRequest) {
  try {
    // In a stateless JWT system, logout is handled client-side (delete token).
    // We're not tracking sessions on the server in this basic implementation.
    // For advanced scenarios, you could invalidate tokens in a blacklist.

    return NextResponse.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const POST = withAuth(handler);
