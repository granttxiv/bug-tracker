import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  pgEnum,
  text,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "agent", "client"]);
export const ticketTypeEnum = pgEnum("ticket_type", ["bug", "feature_request", "support"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["critical", "high", "medium", "low"]);
export const ticketStatusEnum = pgEnum("ticket_status", [
  "new",
  "acknowledged",
  "triaged",
  "in_progress",
  "resolved",
  "closed",
]);
export const environmentEnum = pgEnum("environment", ["production", "staging", "development"]);
export const ticketActivityActionEnum = pgEnum("ticket_activity_action", [
  "created",
  "status_changed",
  "assigned",
  "commented",
  "attachment_added",
]);
export const commentTypeEnum = pgEnum("comment_type", ["public_reply", "internal_note"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("client"),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User sessions table (for JWT tracking)
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: varchar("token", { length: 500 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tickets table (Core)
export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    assignedTo: uuid("assigned_to").references(() => users.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    type: ticketTypeEnum("type").notNull(),
    priority: ticketPriorityEnum("priority").notNull().default("medium"),
    status: ticketStatusEnum("status").notNull().default("new"),
    version: varchar("version", { length: 100 }),
    environment: environmentEnum("environment"),
    stepsToReproduce: text("steps_to_reproduce"),
    expectedBehavior: text("expected_behavior"),
    actualBehavior: text("actual_behavior"),
    resolvedAt: timestamp("resolved_at"),
    closedAt: timestamp("closed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tickets_client_id").on(table.clientId),
    index("idx_tickets_assigned_to").on(table.assignedTo),
    index("idx_tickets_status").on(table.status),
    index("idx_tickets_priority").on(table.priority),
    index("idx_tickets_created_at").on(table.createdAt),
  ],
);

// Ticket comments table
export const ticketComments = pgTable(
  "ticket_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id")
      .references(() => tickets.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "set null" })
      .notNull(),
    body: text("body").notNull(),
    type: commentTypeEnum("type").notNull().default("public_reply"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_ticket_comments_ticket_id").on(table.ticketId),
    index("idx_ticket_comments_user_id").on(table.userId),
  ],
);

// Ticket activities table (audit log)
export const ticketActivities = pgTable(
  "ticket_activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id")
      .references(() => tickets.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: ticketActivityActionEnum("action").notNull(),
    oldValue: jsonb("old_value"),
    newValue: jsonb("new_value"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_ticket_activities_ticket_id").on(table.ticketId),
    index("idx_ticket_activities_created_at").on(table.createdAt),
  ],
);

// Ticket attachments table (metadata only, files stored in S3)
export const ticketAttachments = pgTable(
  "ticket_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id")
      .references(() => tickets.id, { onDelete: "cascade" })
      .notNull(),
    uploadedBy: uuid("uploaded_by")
      .references(() => users.id, { onDelete: "set null" })
      .notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    s3Key: varchar("s3_key", { length: 500 }).notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_ticket_attachments_ticket_id").on(table.ticketId)],
);

// Type definitions
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type UserRole = "admin" | "agent" | "client";

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type TicketType = "bug" | "feature_request" | "support";
export type TicketPriority = "critical" | "high" | "medium" | "low";
export type TicketStatus =
  | "new"
  | "acknowledged"
  | "triaged"
  | "in_progress"
  | "resolved"
  | "closed";
export type Environment = "production" | "staging" | "development";

export type TicketComment = typeof ticketComments.$inferSelect;
export type NewTicketComment = typeof ticketComments.$inferInsert;
export type CommentType = "public_reply" | "internal_note";

export type TicketActivity = typeof ticketActivities.$inferSelect;
export type NewTicketActivity = typeof ticketActivities.$inferInsert;
export type TicketActivityAction =
  | "created"
  | "status_changed"
  | "assigned"
  | "commented"
  | "attachment_added";

export type TicketAttachment = typeof ticketAttachments.$inferSelect;
export type NewTicketAttachment = typeof ticketAttachments.$inferInsert;

// Automation Rules (Phase 3)
export const automationRules = pgTable("automation_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  conditions: jsonb("conditions").notNull(), // { type?: string, priority?: string, status?: string }
  actions: jsonb("actions").notNull(), // { autoAssignTo?: string, priority?: string, status?: string }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SLA Policies (Phase 3)
export const slaPolicies = pgTable("sla_policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  firstResponseHours: integer("first_response_hours").notNull(), // Hours to first response
  resolutionHours: integer("resolution_hours").notNull(), // Hours to resolution
  conditions: jsonb("conditions").notNull(), // { type?: string, priority?: string }
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SLA Breaches (Phase 3)
export const slaBreaches = pgTable(
  "sla_breaches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id")
      .references(() => tickets.id, { onDelete: "cascade" })
      .notNull(),
    policyId: uuid("policy_id").references(() => slaPolicies.id, { onDelete: "set null" }),
    breachType: varchar("breach_type", { length: 50 }).notNull(), // "first_response" | "resolution"
    breachedAt: timestamp("breached_at").notNull(),
    notifiedAt: timestamp("notified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_sla_breaches_ticket_id").on(table.ticketId)],
);

export type AutomationRule = typeof automationRules.$inferSelect;
export type NewAutomationRule = typeof automationRules.$inferInsert;
export type SLAPolicy = typeof slaPolicies.$inferSelect;
export type NewSLAPolicy = typeof slaPolicies.$inferInsert;
export type SLABreach = typeof slaBreaches.$inferSelect;
export type NewSLABreach = typeof slaBreaches.$inferInsert;

// Knowledge Base (Phase 4)
export const kbArticles = pgTable(
  "kb_articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    content: text("content").notNull(),
    category: varchar("category", { length: 100 }),
    tags: text("tags"),
    published: boolean("published").notNull().default(false),
    viewCount: integer("view_count").notNull().default(0),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_kb_published").on(table.published),
    index("idx_kb_category").on(table.category),
    index("idx_kb_slug").on(table.slug),
  ],
);

export type KBArticle = typeof kbArticles.$inferSelect;
export type NewKBArticle = typeof kbArticles.$inferInsert;
