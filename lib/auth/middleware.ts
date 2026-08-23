import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader, JWTPayload } from "./jwt";
import { AppRouteHandlerRoutes } from "@/.next/dev/types/routes";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * @dev loosely typed for RouteContext
 */
export function withAuth<Path extends AppRouteHandlerRoutes>(
  handler: (req: AuthenticatedRequest, ctx: RouteContext<Path>) => Promise<NextResponse>,
) {
  return async (req: NextRequest, ctx: RouteContext<Path>) => {
    const token = extractTokenFromHeader(req.headers.get("Authorization") || "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token" },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired token" },
        { status: 401 },
      );
    }

    (req as AuthenticatedRequest).user = payload;
    return handler(req as AuthenticatedRequest, ctx);
  };
}

export function withRole<Path extends AppRouteHandlerRoutes>(
  allowedRoles: string[],
  handler: (req: AuthenticatedRequest, ctx: RouteContext<Path>) => Promise<NextResponse>,
) {
  return withAuth(async (req: AuthenticatedRequest, ctx: RouteContext<Path>) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }
    return handler(req, ctx);
  });
}
