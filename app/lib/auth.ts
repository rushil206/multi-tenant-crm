import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type TokenPayload = {
  userId: string;
  organizationId: string;
  role: string;
};

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;
    return decoded;
  } catch (error) {
    // Token is invalid, expired, or tampered with
    return null;
  }
}
export function requireRole(user: TokenPayload, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}