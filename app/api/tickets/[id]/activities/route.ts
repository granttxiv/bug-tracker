import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { getTicketActivities, getTicket } from "@/lib/db/tickets";

/**
 * @dev type the path so we get it.
 */
export const GET = withAuth<"/api/tickets/[id]/activities">(
  async (req: AuthenticatedRequest, ctx) => {
    try {
      const ticketId = (await ctx.params).id;

      if (!ticketId) {
        return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
      }

      const ticket = await getTicket(ticketId);

      if (!ticket) {
        return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      }

      // Check access: clients can only see activities for their own tickets
      if (req.user?.role === "client" && ticket.clientId !== req.user!.userId) {
        return NextResponse.json(
          { error: "You don't have access to this ticket" },
          { status: 403 },
        );
      }

      const activities = await getTicketActivities(ticketId);

      return NextResponse.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
    }
  },
);
