import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
	try {
		const currentUser = await db
			.select({ company: users.company })
			.from(users)
			.where(eq(users.id, req.user!.userId))
			.limit(1);
		const company = currentUser[0]?.company;
		const team = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				role: users.role,
			})
			.from(users)
			.where(
				company ? eq(users.company, company) : eq(users.id, req.user!.userId),
			);
		return NextResponse.json(team);
	} catch (error) {
		console.error("Error listing team users:", error);
		return NextResponse.json(
			{ error: "Failed to list team users" },
			{ status: 500 },
		);
	}
});
