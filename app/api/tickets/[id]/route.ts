import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { db } from "@/lib/db/client";
import { tickets } from "@/lib/db/schema";
import { UpdateTicketSchema } from "@/lib/types/ticket";
import {
	getTicketWithDetails,
	updateTicket,
	getTicket,
	logActivity,
} from "@/lib/db/tickets";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
	try {
		const id = req.nextUrl.pathname.split("/").pop();

		if (!id) {
			return NextResponse.json(
				{ error: "Ticket ID is required" },
				{ status: 400 },
			);
		}

		const ticket = await getTicketWithDetails(id);

		if (!ticket) {
			return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
		}

		// Check access: clients can only see their own tickets
		if (req.user?.role === "client" && ticket.clientId !== req.user!.userId) {
			return NextResponse.json(
				{ error: "You don't have access to this ticket" },
				{ status: 403 },
			);
		}

		return NextResponse.json(ticket);
	} catch (error) {
		console.error("Error fetching ticket:", error);
		return NextResponse.json(
			{ error: "Failed to fetch ticket" },
			{ status: 500 },
		);
	}
});

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
	try {
		const id = req.nextUrl.pathname.split("/").pop();

		if (!id) {
			return NextResponse.json(
				{ error: "Ticket ID is required" },
				{ status: 400 },
			);
		}

		const body = await req.json();

		// Validate request body
		const validation = UpdateTicketSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Invalid input",
					details: validation.error.issues.map((i) => i.message),
				},
				{ status: 400 },
			);
		}

		const ticket = await getTicket(id);

		if (!ticket) {
			return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
		}

		// Check access: clients can only update their own tickets
		if (req.user?.role === "client" && ticket.clientId !== req.user!.userId) {
			return NextResponse.json(
				{ error: "You don't have access to this ticket" },
				{ status: 403 },
			);
		}

		const updates = validation.data;
		const oldValues: Record<string, unknown> = {};
		const newValues: Record<string, unknown> = {};

		// Track what changed
		if (updates.title && ticket.title !== updates.title) {
			oldValues.title = ticket.title;
			newValues.title = updates.title;
		}
		if (updates.priority && ticket.priority !== updates.priority) {
			oldValues.priority = ticket.priority;
			newValues.priority = updates.priority;
		}
		if (updates.description && ticket.description !== updates.description) {
			oldValues.description = ticket.description;
			newValues.description = updates.description;
		}
		if (
			updates.stepsToReproduce &&
			ticket.stepsToReproduce !== updates.stepsToReproduce
		) {
			oldValues.stepsToReproduce = ticket.stepsToReproduce;
			newValues.stepsToReproduce = updates.stepsToReproduce;
		}
		if (
			updates.expectedBehavior &&
			ticket.expectedBehavior !== updates.expectedBehavior
		) {
			oldValues.expectedBehavior = ticket.expectedBehavior;
			newValues.expectedBehavior = updates.expectedBehavior;
		}
		if (
			updates.actualBehavior &&
			ticket.actualBehavior !== updates.actualBehavior
		) {
			oldValues.actualBehavior = ticket.actualBehavior;
			newValues.actualBehavior = updates.actualBehavior;
		}
		if (updates.status && ticket.status !== updates.status) {
			oldValues.status = ticket.status;
			newValues.status = updates.status;
		}

		// Update the ticket
		const updated = await updateTicket(id, {
			title: updates.title,
			priority: updates.priority,
			description: updates.description,
			stepsToReproduce: updates.stepsToReproduce,
			expectedBehavior: updates.expectedBehavior,
			actualBehavior: updates.actualBehavior,
			status: updates.status,
		});

		// Log the activity if something changed
		if (Object.keys(newValues).length > 0) {
			await logActivity({
				ticketId: id,
				userId: req.user!.userId,
				action: "status_changed", // This should be more specific, but we'll use this for field changes
				oldValue: Object.keys(oldValues).length > 0 ? oldValues : null,
				newValue: newValues,
			});
		}

		return NextResponse.json(updated);
	} catch (error) {
		console.error("Error updating ticket:", error);
		return NextResponse.json(
			{ error: "Failed to update ticket" },
			{ status: 500 },
		);
	}
});

export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
	try {
		const id = req.nextUrl.pathname.split("/").pop();
		if (!id)
			return NextResponse.json(
				{ error: "Ticket ID is required" },
				{ status: 400 },
			);
		const ticket = await getTicket(id);
		if (!ticket)
			return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
		if (req.user?.role !== "admin" && ticket.clientId !== req.user?.userId) {
			return NextResponse.json(
				{ error: "You don't have access to this ticket" },
				{ status: 403 },
			);
		}
		const deleted = await db
			.delete(tickets)
			.where(eq(tickets.id, id))
			.returning();
		return NextResponse.json({ ticket: deleted[0] });
	} catch (error) {
		console.error("Error deleting ticket:", error);
		return NextResponse.json(
			{ error: "Failed to delete ticket" },
			{ status: 500 },
		);
	}
});
