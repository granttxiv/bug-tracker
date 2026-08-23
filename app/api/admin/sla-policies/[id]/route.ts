import { NextResponse } from "next/server";
import { withRole } from "@/lib/auth/middleware";
import type { AuthenticatedRequest } from "@/lib/auth/middleware";
import { updateSLAPolicy, deleteSLAPolicy } from "@/lib/db/automation";

export const PATCH = withRole<"/api/admin/sla-policies/[id]">(
  ["admin"],
  async (req: AuthenticatedRequest, ctx) => {
    try {
      const { id } = await ctx.params;
      const body = await req.json();
      const policy = await updateSLAPolicy(id, body);
      if (!policy) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(policy);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
  },
);

export const DELETE = withRole<"/api/admin/sla-policies/[id]">(
  ["admin"],
  async (req: AuthenticatedRequest, ctx) => {
    try {
      const { id } = await ctx.params;
      await deleteSLAPolicy(id);
      return NextResponse.json({ message: "Deleted" });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
  },
);
