import { NextResponse } from "next/server";
import { withRole } from "@/lib/auth/middleware";
import { getSLAComplianceMetrics } from "@/lib/services/metricsService";
import { z } from "zod";

const querySchema = z.object({
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
});

export const GET = withRole(["admin"])(async (req) => {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
  }

  const { startDate, endDate } = parsed.data;
  const metrics = await getSLAComplianceMetrics(
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined,
  );

  return NextResponse.json(metrics);
});
