import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { getUserFromRequest } from "@/app/lib/auth";

const prisma = new PrismaClient();

// GET /api/customers — list all customers for the logged-in user's organization
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customers = await prisma.customer.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(customers);
}

// POST /api/customers — create a new customer
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, phone } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      email,
      phone,
      organizationId: user.organizationId,
    },
  });

  return NextResponse.json(customer, { status: 201 });
}