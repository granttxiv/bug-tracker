import { db } from "@/lib/db/client";
import { tickets, slaBreaches } from "@/lib/db/schema";
import { and, gte, lte, count, sql, isNotNull } from "drizzle-orm";

// Volume report: tickets by status, type, date range
export async function getVolumeMetrics(startDate?: Date, endDate?: Date) {
  const conditions = [];
  if (startDate) conditions.push(gte(tickets.createdAt, startDate));
  if (endDate) conditions.push(lte(tickets.createdAt, endDate));

  const byStatus = await db
    .select({
      status: tickets.status,
      count: count(),
    })
    .from(tickets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(tickets.status);

  const byType = await db
    .select({
      type: tickets.type,
      count: count(),
    })
    .from(tickets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(tickets.type);

  const byPriority = await db
    .select({
      priority: tickets.priority,
      count: count(),
    })
    .from(tickets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(tickets.priority);

  return { byStatus, byType, byPriority };
}

// Resolution time: avg time from created to resolved
export async function getResolutionTimeMetrics(startDate?: Date, endDate?: Date) {
  const conditions = [isNotNull(tickets.resolvedAt)];
  if (startDate) conditions.push(gte(tickets.createdAt, startDate));
  if (endDate) conditions.push(lte(tickets.createdAt, endDate));

  // Calculate avg resolution time in hours
  const result = await db
    .select({
      avgHours: sql<number>`AVG(EXTRACT(EPOCH FROM (${tickets.resolvedAt} - ${tickets.createdAt})) / 3600)`,
    })
    .from(tickets)
    .where(and(...conditions));

  return result[0]?.avgHours || 0;
}

// Agent performance: tickets assigned, resolved, avg resolution time
export async function getAgentPerformanceMetrics() {
  // Tickets assigned per agent
  const assigned = await db
    .select({
      agentId: tickets.assignedTo,
      count: count(),
    })
    .from(tickets)
    .where(isNotNull(tickets.assignedTo))
    .groupBy(tickets.assignedTo);

  // Tickets resolved per agent
  const resolved = await db
    .select({
      agentId: tickets.assignedTo,
      count: count(),
    })
    .from(tickets)
    .where(and(isNotNull(tickets.assignedTo), isNotNull(tickets.resolvedAt)))
    .groupBy(tickets.assignedTo);

  return { assigned, resolved };
}

// SLA compliance: breach rates by priority
export async function getSLAComplianceMetrics(startDate?: Date, endDate?: Date) {
  const conditions = [];
  if (startDate) conditions.push(gte(slaBreaches.breachedAt, startDate));
  if (endDate) conditions.push(lte(slaBreaches.breachedAt, endDate));

  const breachByType = await db
    .select({
      type: slaBreaches.breachType,
      count: count(),
    })
    .from(slaBreaches)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(slaBreaches.breachType);

  const totalBreaches = breachByType.reduce((sum, b) => sum + b.count, 0);

  return { breachByType, totalBreaches };
}

// Total ticket count
export async function getTotalTickets() {
  const [result] = await db.select({ count: count() }).from(tickets);
  return result.count;
}
