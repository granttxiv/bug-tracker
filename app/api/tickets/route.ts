import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { CreateTicketSchema, ListTicketsSchema } from "@/lib/types/ticket";
import { evaluateAutomationRules, applySLAPolicy } from "@/lib/services/automationEngine";
import { searchArticles } from "@/lib/db/kb";
import { createNotification } from "@/lib/db/notifications";
import { sendEmail, getTicketCreatedEmail } from "@/lib/services/emailService";
import { addTicketMembers, createTicket, listClientTickets } from "@/lib/db/tickets";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();

    // Validate request body
    const validation = CreateTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.issues.map((i) => i.message),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Only clients can create tickets (or admins on their behalf)
    if (req.user?.role !== "client" && req.user?.role !== "admin") {
      return NextResponse.json({ error: "Only clients can create tickets" }, { status: 403 });
    }

    const memberIds = [
      ...new Set([...(data.memberIds ?? []), ...(data.assignedTo ? [data.assignedTo] : [])]),
    ];
    if (memberIds.length > 0) {
      const assignee = await db
        .select({ id: users.id, company: users.company, role: users.role })
        .from(users)
        .where(inArray(users.id, memberIds));
      const owner = await db
        .select({ company: users.company })
        .from(users)
        .where(eq(users.id, req.user!.userId))
        .limit(1);
      if (
        assignee.length !== memberIds.length ||
        (req.user?.role !== "admin" &&
          assignee.some((member) => member.company !== owner[0]?.company))
      ) {
        return NextResponse.json({ error: "Invalid team assignee" }, { status: 400 });
      }
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
      assignedTo: data.assignedTo,
    });
    await addTicketMembers(ticket.id, memberIds);

    // Evaluate automation rules (Phase 3)
    await evaluateAutomationRules(ticket);

    // Apply SLA policy (Phase 3)
    await applySLAPolicy(ticket);

    // Get KB suggestions (Phase 4)
    const suggestions = await searchArticles(`${ticket.title} ${ticket.description}`, 3);

    // Send notifications (Phase 5)
    await createNotification({
      userId: ticket.clientId,
      type: "ticket_created",
      title: "Ticket Created",
      message: `Your ticket "${ticket.title}" has been received.`,
      ticketId: ticket.id,
    });

    // Send email (Phase 5)
    const emailTemplate = getTicketCreatedEmail(
      req.user!.email || "Client",
      ticket.title,
      ticket.id,
    );
    await sendEmail({ to: req.user!.email || "", ...emailTemplate });

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
    return NextResponse.json({ ...ticket, kbSuggestions: suggestions }, { status: 201 });
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
