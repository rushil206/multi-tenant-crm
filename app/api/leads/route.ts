import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { getUserFromRequest } from "@/app/lib/auth";

const prisma = new PrismaClient();

// GET /api/leads — list all leads for the logged-in user's organization
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leads);
}

// POST /api/leads — create a new lead for the logged-in user's organization
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, phone, source } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      name,
      email,
      phone,
      source,
      organizationId: user.organizationId, // this is the multi-tenancy magic
    },
  });

  return NextResponse.json(lead, { status: 201 });
}