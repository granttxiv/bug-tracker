import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { getTicketActivities, getTicket } from "@/lib/db/tickets";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const id = req.nextUrl.pathname.split("/").slice(-3)[0];

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const ticket = await getTicket(id);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Check access: clients can only see activities for their own tickets
    if (req.user?.role === "client" && ticket.clientId !== req.user!.userId) {
      return NextResponse.json({ error: "You don't have access to this ticket" }, { status: 403 });
    }

    const activities = await getTicketActivities(id);

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
});
