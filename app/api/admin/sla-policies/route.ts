import { NextResponse } from "next/server";
import { withRole } from "@/lib/auth/middleware";
import type { AuthenticatedRequest } from "@/lib/auth/middleware";
import { getSLAPolicies, createSLAPolicy } from "@/lib/db/automation";

export const GET = withRole(["admin"])(async (_req, _ctx) => {
  try {
    const policies = await getSLAPolicies();
    return NextResponse.json(policies);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
});

export const POST = withRole(["admin"])(async (req: AuthenticatedRequest, _ctx) => {
  try {
    const body = await req.json();

    if (!body.name || !body.firstResponseHours || !body.resolutionHours || !body.conditions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const policy = await createSLAPolicy({
      name: body.name,
      description: body.description,
      firstResponseHours: body.firstResponseHours,
      resolutionHours: body.resolutionHours,
      conditions: body.conditions,
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
});
