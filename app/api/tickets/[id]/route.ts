import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { UpdateTicketSchema } from "@/lib/types/ticket";
import { getTicketWithDetails, updateTicket, getTicket, logActivity } from "@/lib/db/tickets";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const ticket = await getTicketWithDetails(id);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Check access: clients can only see their own tickets
    if (req.user?.role === "client" && ticket.clientId !== req.user!.userId) {
      return NextResponse.json({ error: "You don't have access to this ticket" }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
});

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const body = await req.json();

    // Validate request body
    const validation = UpdateTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues.map((i) => i.message) },
        { status: 400 },
      );
    }

    const ticket = await getTicket(id);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Check access: clients can only update their own tickets
    if (req.user?.role === "client" && ticket.clientId !== req.user!.userId) {
      return NextResponse.json({ error: "You don't have access to this ticket" }, { status: 403 });
    }

    const updates = validation.data;
    const oldValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};

    // Track what changed
    if (updates.description && ticket.description !== updates.description) {
      oldValues.description = ticket.description;
      newValues.description = updates.description;
    }
    if (updates.stepsToReproduce && ticket.stepsToReproduce !== updates.stepsToReproduce) {
      oldValues.stepsToReproduce = ticket.stepsToReproduce;
      newValues.stepsToReproduce = updates.stepsToReproduce;
    }
    if (updates.expectedBehavior && ticket.expectedBehavior !== updates.expectedBehavior) {
      oldValues.expectedBehavior = ticket.expectedBehavior;
      newValues.expectedBehavior = updates.expectedBehavior;
    }
    if (updates.actualBehavior && ticket.actualBehavior !== updates.actualBehavior) {
      oldValues.actualBehavior = ticket.actualBehavior;
      newValues.actualBehavior = updates.actualBehavior;
    }

    // Update the ticket
    const updated = await updateTicket(id, {
      description: updates.description,
      stepsToReproduce: updates.stepsToReproduce,
      expectedBehavior: updates.expectedBehavior,
      actualBehavior: updates.actualBehavior,
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
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
});
