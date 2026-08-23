import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { AddCommentSchema } from "@/lib/types/ticket";
import { addComment, getTicket, logActivity } from "@/lib/db/tickets";

export const POST = withAuth<"/api/tickets/[id]/comments">(
  async (req: AuthenticatedRequest, ctx) => {
    try {
      const ticketId = (await ctx.params).id;

      if (!ticketId) {
        return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
      }

      const body = await req.json();

      // Validate request body
      const validation = AddCommentSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Invalid input",
            details: validation.error.issues.map((i) => i.message),
          },
          { status: 400 },
        );
      }

      const ticket = await getTicket(ticketId);

      if (!ticket) {
        return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      }

      // Check access: clients can only comment on their own tickets
      if (req.user?.role === "client" && ticket.clientId !== req.user!.userId) {
        return NextResponse.json(
          { error: "You don't have access to this ticket" },
          { status: 403 },
        );
      }

      const data = validation.data;

      // Create the comment
      const comment = await addComment({
        ticketId,
        userId: req.user!.userId,
        body: data.body,
        type: data.type,
      });

      // Log the activity
      await logActivity({
        ticketId,
        userId: req.user!.userId,
        action: "commented",
        oldValue: null,
        newValue: {
          commentType: data.type,
          commentId: comment.id,
        },
      });

      return NextResponse.json(comment, { status: 201 });
    } catch (error) {
      console.error("Error adding comment:", error);
      return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }
  },
);
