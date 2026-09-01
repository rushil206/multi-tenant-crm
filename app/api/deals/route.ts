import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest } from "@/app/lib/auth";

const prisma = new PrismaClient();

// GET /api/deals — list all deals for the logged-in user's organization
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deals = await prisma.deal.findMany({
    where: { organizationId: user.organizationId },
    include: {
      customer: true,     // also fetch the linked customer's details
      assignedTo: true,   // also fetch the linked user's details
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(deals);
}

// POST /api/deals — create a new deal
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, value, status, customerId, assignedToId } = body;

  if (!title || !customerId) {
    return NextResponse.json(
      { error: "Title and customerId are required" },
      { status: 400 }
    );
  }

  // Safety check: make sure the customer actually belongs to this org
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId: user.organizationId },
  });

  if (!customer) {
    return NextResponse.json(
      { error: "Customer not found in your organization" },
      { status: 404 }
    );
  }

  const deal = await prisma.deal.create({
    data: {
      title,
      value: value || 0,
      status: status || "NEW",
      customerId,
      assignedToId: assignedToId || user.userId,
      organizationId: user.organizationId,
    },
  });

  return NextResponse.json(deal, { status: 201 });
}