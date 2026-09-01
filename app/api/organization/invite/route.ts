import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest, requireRole } from "@/app/lib/auth";
import crypto from "crypto";

const prisma = new PrismaClient();

// POST /api/organization/invite — Owner/Admin generates an invite for a new team member
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!requireRole(user, ["OWNER", "ADMIN"])) {
    return NextResponse.json(
      { error: "You don't have permission to invite team members" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { email, role } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Generate a random, unguessable token
  const token = crypto.randomBytes(32).toString("hex");

  // Invitation expires in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.invitation.create({
    data: {
      email,
      role: role || "SALES_REP",
      token,
      expiresAt,
      organizationId: user.organizationId,
    },
  });

  // In a real app, you'd email this link. For now, we return it directly.
  const inviteLink = `http://localhost:3000/signup?invite=${token}`;

  return NextResponse.json({
    message: "Invitation created",
    inviteLink,
    invitation,
  });
}
