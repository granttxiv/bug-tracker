import { db } from "./client";
import {
	tickets,
	ticketComments,
	ticketActivities,
	ticketAttachments,
	ticketMembers,
	users,
	Ticket,
	NewTicket,
	TicketComment,
	NewTicketComment,
	TicketActivity,
	NewTicketActivity,
	TicketAttachment,
	NewTicketAttachment,
	TicketStatus,
	TicketPriority,
} from "./schema";
import { eq, and, desc, asc, count } from "drizzle-orm";

// Create a new ticket
export async function createTicket(data: NewTicket): Promise<Ticket> {
	const [ticket] = await db.insert(tickets).values(data).returning();
	return ticket;
}

export async function addTicketMembers(ticketId: string, userIds: string[]) {
	if (userIds.length === 0) return [];
	return db
		.insert(ticketMembers)
		.values([...new Set(userIds)].map((userId) => ({ ticketId, userId })))
		.returning();
}

export async function getTicketMembers(ticketId: string) {
	return db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			role: users.role,
		})
		.from(ticketMembers)
		.innerJoin(users, eq(ticketMembers.userId, users.id))
		.where(eq(ticketMembers.ticketId, ticketId));
}

// Get ticket by ID with comments and attachments
export async function getTicketWithDetails(ticketId: string) {
	const [ticket] = await db
		.select()
		.from(tickets)
		.where(eq(tickets.id, ticketId));

	if (!ticket) {
		return null;
	}

	const comments = await db
		.select()
		.from(ticketComments)
		.where(eq(ticketComments.ticketId, ticketId))
		.orderBy(asc(ticketComments.createdAt));

	const attachments = await db
		.select()
		.from(ticketAttachments)
		.where(eq(ticketAttachments.ticketId, ticketId))
		.orderBy(desc(ticketAttachments.createdAt));

	const assignedUser = ticket.assignedTo
		? await db.select().from(users).where(eq(users.id, ticket.assignedTo))
		: null;
	const members = await getTicketMembers(ticketId);
	console.log(assignedUser)

	return {
		...ticket,
		comments,
		attachments,
		assignedUser: assignedUser ? assignedUser[0] : null,
		members,
	};
}

// List tickets for a client with pagination
export async function listClientTickets(
	clientId: string,
	options: {
		status?: string;
		priority?: string;
		limit?: number;
		offset?: number;
	} = {},
) {
	const { status, priority, limit = 20, offset = 0 } = options;

	const conditions = [eq(tickets.clientId, clientId)];

	if (status) {
		conditions.push(eq(tickets.status, status as TicketStatus));
	}

	if (priority) {
		conditions.push(eq(tickets.priority, priority as TicketPriority));
	}

	const ticketList = await db
		.select()
		.from(tickets)
		.where(and(...conditions))
		.orderBy(desc(tickets.createdAt))
		.limit(limit)
		.offset(offset);

	// Get total count
	const countResult = await db
		.select({ count: count() })
		.from(tickets)
		.where(and(...conditions));

	return {
		tickets: ticketList,
		total: Number(countResult[0]?.count ?? 0),
		limit,
		offset,
	};
}

// Update ticket
export async function updateTicket(
	ticketId: string,
	data: Partial<NewTicket>,
): Promise<Ticket | null> {
	const [updated] = await db
		.update(tickets)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(tickets.id, ticketId))
		.returning();

	return updated || null;
}

// Add comment to ticket
export async function addComment(
	data: NewTicketComment,
): Promise<TicketComment> {
	const [comment] = await db.insert(ticketComments).values(data).returning();
	return comment;
}

// Get ticket comments
export async function getTicketComments(ticketId: string) {
	return db
		.select()
		.from(ticketComments)
		.where(eq(ticketComments.ticketId, ticketId))
		.orderBy(asc(ticketComments.createdAt));
}

// Log ticket activity
export async function logActivity(
	data: NewTicketActivity,
): Promise<TicketActivity> {
	const [activity] = await db.insert(ticketActivities).values(data).returning();
	return activity;
}

// Get ticket activities
export async function getTicketActivities(ticketId: string) {
	return db
		.select()
		.from(ticketActivities)
		.where(eq(ticketActivities.ticketId, ticketId))
		.orderBy(desc(ticketActivities.createdAt));
}

// Add attachment metadata
export async function addAttachment(
	data: NewTicketAttachment,
): Promise<TicketAttachment> {
	const [attachment] = await db
		.insert(ticketAttachments)
		.values(data)
		.returning();
	return attachment;
}

// Get ticket attachments
export async function getTicketAttachments(ticketId: string) {
	return db
		.select()
		.from(ticketAttachments)
		.where(eq(ticketAttachments.ticketId, ticketId))
		.orderBy(desc(ticketAttachments.createdAt));
}

// Delete attachment
export async function deleteAttachment(
	attachmentId: string,
): Promise<TicketAttachment | null> {
	const [deleted] = await db
		.delete(ticketAttachments)
		.where(eq(ticketAttachments.id, attachmentId))
		.returning();

	return deleted || null;
}

// Get single ticket (basic)
export async function getTicket(ticketId: string): Promise<Ticket | null> {
	const [ticket] = await db
		.select()
		.from(tickets)
		.where(eq(tickets.id, ticketId));

	return ticket || null;
}
