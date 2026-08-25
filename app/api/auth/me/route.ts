import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.email("Invalid email address").optional(),
  company: z.string().max(255).optional(),
});

async function handler(req: AuthenticatedRequest) {
  try {
    if (!req.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userList = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    if (userList.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userList[0];

    if (req.method === "PATCH") {
      const body = await req.json();
      const parsed = updateUserSchema.parse(body);

      const emailToUse = parsed.email ?? user.email;
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, emailToUse))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== user.id) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 },
        );
      }

      const [updatedUser] = await db
        .update(users)
        .set({
          name: parsed.name ?? user.name,
          email: emailToUse,
          company: parsed.company ?? user.company ?? null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();

      return NextResponse.json({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          company: updatedUser.company,
        },
      });
    }

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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues.map((i) => i.message) },
        { status: 400 },
      );
    }

    console.error("Get or update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return withAuth(handler)(req);
}

export async function PATCH(req: NextRequest) {
  return withAuth(handler)(req);
}
