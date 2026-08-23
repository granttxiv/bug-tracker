import { db } from "./client";
import {
  automationRules,
  slaPolicies,
  slaBreaches,
  NewAutomationRule,
  NewSLAPolicy,
} from "./schema";
import { eq } from "drizzle-orm";

// Automation Rules
export async function createAutomationRule(data: NewAutomationRule) {
  const [rule] = await db.insert(automationRules).values(data).returning();
  return rule;
}

export async function getAutomationRules() {
  return db.select().from(automationRules).orderBy(automationRules.createdAt);
}

export async function updateAutomationRule(id: string, data: Partial<NewAutomationRule>) {
  const [updated] = await db
    .update(automationRules)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(automationRules.id, id))
    .returning();
  return updated || null;
}

export async function deleteAutomationRule(id: string) {
  await db.delete(automationRules).where(eq(automationRules.id, id));
}

// SLA Policies
export async function createSLAPolicy(data: NewSLAPolicy) {
  const [policy] = await db.insert(slaPolicies).values(data).returning();
  return policy;
}

export async function getSLAPolicies() {
  return db.select().from(slaPolicies).orderBy(slaPolicies.createdAt);
}

export async function updateSLAPolicy(id: string, data: Partial<NewSLAPolicy>) {
  const [updated] = await db
    .update(slaPolicies)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(slaPolicies.id, id))
    .returning();
  return updated || null;
}

export async function deleteSLAPolicy(id: string) {
  await db.delete(slaPolicies).where(eq(slaPolicies.id, id));
}

// SLA Breaches
export async function createSLABreach(data: {
  ticketId: string;
  policyId?: string;
  breachType: "first_response" | "resolution";
}) {
  const [breach] = await db
    .insert(slaBreaches)
    .values({
      ...data,
      breachedAt: new Date(),
    })
    .returning();
  return breach;
}

export async function getSLABreaches() {
  return db.select().from(slaBreaches).orderBy(slaBreaches.breachedAt);
}

export async function getSLABreachesByTicket(ticketId: string) {
  return db.select().from(slaBreaches).where(eq(slaBreaches.ticketId, ticketId));
}
