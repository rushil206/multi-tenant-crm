import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { getUserFromRequest, requireRole } from "@/app/lib/auth";

const prisma = new PrismaClient();

// GET /api/organization/members — only Owner/Admin can view the full team list
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // This is the RBAC check — Sales Reps and Sales Managers are blocked here
  if (!requireRole(user, ["OWNER", "ADMIN"])) {
    return NextResponse.json(
      { error: "You don't have permission to view this" },
      { status: 403 } // 403 = Forbidden (different from 401 Unauthorized)
    );
  }

  const members = await prisma.user.findMany({
    where: { organizationId: user.organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // Notice: we deliberately do NOT select "password" here — never send password hashes to the frontend
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}