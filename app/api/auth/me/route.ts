import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { eq } from "drizzle-orm";

async function handler(req: AuthenticatedRequest) {
  try {
    if (!req.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch fresh user data from database
    const userList = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);

    if (userList.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userList[0];

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = withAuth(handler);
