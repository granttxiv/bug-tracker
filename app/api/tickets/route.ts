import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { CreateTicketSchema, ListTicketsSchema } from "@/lib/types/ticket";
import { createTicket, listClientTickets, logActivity } from "@/lib/db/tickets";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();

    // Validate request body
    const validation = CreateTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues.map((i) => i.message) },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Only clients can create tickets (or admins on their behalf)
    if (req.user?.role !== "client" && req.user?.role !== "admin") {
      return NextResponse.json({ error: "Only clients can create tickets" }, { status: 403 });
    }

    // Create the ticket
    const ticket = await createTicket({
      clientId: req.user!.userId,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      status: "new",
      version: data.version,
      environment: data.environment,
      stepsToReproduce: data.stepsToReproduce,
      expectedBehavior: data.expectedBehavior,
      actualBehavior: data.actualBehavior,
    });

    // Log the activity
    await logActivity({
      ticketId: ticket.id,
      userId: req.user!.userId,
      action: "created",
      oldValue: null,
      newValue: {
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    // Validate query parameters
    const queryData = {
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      limit: searchParams.get("limit") || "20",
      offset: searchParams.get("offset") || "0",
    };

    const validation = ListTicketsSchema.safeParse(queryData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validation.error.issues.map((i) => i.message),
        },
        { status: 400 },
      );
    }

    const { status, priority, limit, offset } = validation.data;

    // Clients can only see their own tickets
    const clientId =
      req.user?.role === "admin"
        ? searchParams.get("clientId") || req.user!.userId
        : req.user!.userId;

    // If a client tries to view another client's tickets, deny access
    if (req.user?.role === "client" && clientId !== req.user!.userId) {
      return NextResponse.json({ error: "You can only view your own tickets" }, { status: 403 });
    }

    const result = await listClientTickets(clientId, {
      status,
      priority,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing tickets:", error);
    return NextResponse.json({ error: "Failed to list tickets" }, { status: 500 });
  }
});
