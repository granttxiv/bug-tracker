import { z } from "zod";

export const CreateTicketSchema = z.object({
	title: z.string().min(5).max(255),
	description: z.string().min(10),
	type: z.enum(["bug", "feature_request", "support"]),
	assignedTo: z.string().uuid("Invalid assignee").optional(),
	memberIds: z.array(z.string().uuid("Invalid team member")).max(20).optional(),
	priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
	version: z.string().max(100).optional(),
	environment: z.enum(["production", "staging", "development"]).optional(),
	stepsToReproduce: z.string().optional(),
	expectedBehavior: z.string().optional(),
	actualBehavior: z.string().optional(),
});

export const UpdateTicketSchema = z.object({
	title: z.string().min(5).max(255).optional(),
	priority: z.enum(["critical", "high", "medium", "low"]).optional(),
	description: z.string().min(10).optional(),
	status: z
		.enum([
			"new",
			"acknowledged",
			"triaged",
			"in_progress",
			"resolved",
			"closed",
		])
		.optional(),
	stepsToReproduce: z.string().optional(),
	expectedBehavior: z.string().optional(),
	actualBehavior: z.string().optional(),
	// Note: Clients can only update these fields, not status/assignment
});

export const AddCommentSchema = z.object({
	body: z.string().min(1),
	type: z.enum(["public_reply", "internal_note"]).default("public_reply"),
});

export const ListTicketsSchema = z.object({
	status: z.string().optional(),
	priority: z.string().optional(),
	limit: z.coerce.number().min(1).max(100).default(20),
	offset: z.coerce.number().min(0).default(0),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;
export type AddCommentInput = z.infer<typeof AddCommentSchema>;
export type ListTicketsInput = z.infer<typeof ListTicketsSchema>;
