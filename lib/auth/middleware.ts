import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader, JWTPayload } from "./jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
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
    return handler(req as AuthenticatedRequest);
  };
}

export function withRole(
  allowedRoles: string[],
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }
    return handler(req);
  });
}
