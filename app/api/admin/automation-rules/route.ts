import { NextResponse } from "next/server";
import { withRole } from "@/lib/auth/middleware";
import type { AuthenticatedRequest } from "@/lib/auth/middleware";
import { getAutomationRules, createAutomationRule } from "@/lib/db/automation";

// GET /api/admin/automation-rules
export const GET = withRole(["admin"])(async (_req, _ctx) => {
  try {
    const rules = await getAutomationRules();
    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching rules:", error);
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
  }
});

// POST /api/admin/automation-rules
export const POST = withRole(["admin"])(async (req: AuthenticatedRequest, _ctx) => {
  try {
    const body = await req.json();

    if (!body.name || !body.conditions || !body.actions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const rule = await createAutomationRule({
      name: body.name,
      description: body.description,
      conditions: body.conditions,
      actions: body.actions,
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Error creating rule:", error);
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
  }
});
