import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/jwt";
import { z } from "zod";
import { eq } from "drizzle-orm";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Find user
    const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (userList.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = userList[0];

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Generate JWT
    const token = generateToken(user);

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues.map((i) => i.message) },
        { status: 400 },
      );
    }

    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
