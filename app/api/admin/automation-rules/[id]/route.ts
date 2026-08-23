import { NextResponse } from "next/server";
import { withRole } from "@/lib/auth/middleware";
import type { AuthenticatedRequest } from "@/lib/auth/middleware";
import { updateAutomationRule, deleteAutomationRule } from "@/lib/db/automation";

// PATCH
export const PATCH = withRole<"/api/admin/automation-rules/[id]">(
  ["admin"],
  async (req: AuthenticatedRequest, ctx) => {
    try {
      const { id } = await ctx.params;
      const body = await req.json();
      const rule = await updateAutomationRule(id, body);
      if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(rule);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
  },
);

// DELETE
export const DELETE = withRole<"/api/admin/automation-rules/[id]">(
  ["admin"],
  async (req: AuthenticatedRequest, ctx) => {
    try {
      const { id } = await ctx.params;
      await deleteAutomationRule(id);
      return NextResponse.json({ message: "Deleted" });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
  },
);
