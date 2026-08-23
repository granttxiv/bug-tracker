import { db } from "@/lib/db/client";
import { automationRules, slaPolicies, Ticket } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface RuleConditions {
  type?: string;
  priority?: string;
  status?: string;
}

export interface RuleActions {
  autoAssignTo?: string;
  priority?: string;
  status?: string;
}

interface SLAConditions {
  type?: string;
  priority?: string;
}

function isRuleConditions(obj: any): obj is RuleConditions {
  return typeof obj === "object" && ("type" in obj || "priority" in obj || "status" in obj);
}

// Evaluate automation rules on ticket creation/update
export async function evaluateAutomationRules(ticket: Ticket) {
  try {
    const rules = await db.select().from(automationRules).where(eq(automationRules.isActive, true));

    for (const rule of rules) {
      const conditions = rule.conditions as RuleConditions;

      // Check if ticket matches conditions
      if (matchesConditions(ticket, conditions)) {
        await executeActions(ticket.id, rule.actions as RuleActions);
        console.log(`[Automation] Rule "${rule.name}" triggered for ticket ${ticket.id}`);
      }
    }
  } catch (error) {
    console.error("[Automation] Error evaluating rules:", error);
  }
}

// Apply SLA policy on ticket creation
export async function applySLAPolicy(ticket: Ticket) {
  try {
    const policies = await db.select().from(slaPolicies).where(eq(slaPolicies.isActive, true));

    for (const policy of policies) {
      const conditions = policy.conditions as SLAConditions;

      // Check if ticket matches SLA policy conditions
      if (matchesConditions(ticket, conditions)) {
        const now = new Date();
        const firstResponseDue = new Date(now.getTime() + policy.firstResponseHours * 3600000);
        const resolutionDue = new Date(now.getTime() + policy.resolutionHours * 3600000);

        // Store SLA due dates (would need slaTracking table in production)
        console.log(`[SLA] Policy "${policy.name}" applied to ticket ${ticket.id}`);
        console.log(`  First response due: ${firstResponseDue}`);
        console.log(`  Resolution due: ${resolutionDue}`);

        return { firstResponseDue, resolutionDue, policyId: policy.id };
      }
    }
  } catch (error) {
    console.error("[SLA] Error applying policy:", error);
  }
}

// Check for SLA breaches
export async function checkSLABreaches() {
  try {
    // This would query tickets with SLA timers and create breach records
    // Placeholder for now - requires slaTracking table
    console.log("[SLA] Checking for breaches...");
  } catch (error) {
    console.error("[SLA] Error checking breaches:", error);
  }
}

// Helper: Match ticket against conditions
function matchesConditions(ticket: Ticket, conditions: RuleConditions | SLAConditions): boolean {
  if (conditions.type && ticket.type !== conditions.type) return false;
  if (conditions.priority && ticket.priority !== conditions.priority) return false;
  if (isRuleConditions(conditions) && ticket.status !== conditions.status) return false;
  return true;
}

// Helper: Execute rule actions
async function executeActions(ticketId: string, actions: RuleActions) {
  // Actions would be executed here:
  // - auto-assign to agent
  // - change priority
  // - change status
  // For now, log the action
  console.log(`[Automation] Executing actions for ticket ${ticketId}:`, actions);
}
