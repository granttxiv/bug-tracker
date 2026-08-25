import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/jwt";
import { z } from "zod";
import { eq } from "drizzle-orm";

const ADMIN_ACCOUNT = {
  email: "trackme@admin.account.com",
  password: "password123",
  name: "Track Me Admin",
  company: "Track Me",
};

export async function POST() {
  try {
    const { email, password, name, company } = ADMIN_ACCOUNT;

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Admin account already exists" }, { status: 400 });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name,
        company: company || null,
        role: "admin", // Default role for registration
      })
      .returning();

    // Generate JWT
    const token = generateToken(newUser);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        token,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues.map((i) => i.message) },
        { status: 400 },
      );
    }

    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
