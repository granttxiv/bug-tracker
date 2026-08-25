import { NextResponse } from "next/server";
import { withRole } from "@/lib/auth/middleware";
import { getAgentPerformanceMetrics } from "@/lib/services/metricsService";

export const GET = withRole(["admin"])(async () => {
  const metrics = await getAgentPerformanceMetrics();
  return NextResponse.json(metrics);
});
