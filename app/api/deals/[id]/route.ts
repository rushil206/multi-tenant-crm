import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest } from "@/app/lib/auth";

const prisma = new PrismaClient();

// PATCH /api/deals/[id] — update a deal's status (or other fields)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  // Safety check: make sure this deal actually belongs to the user's organization
  const existingDeal = await prisma.deal.findFirst({
    where: { id, organizationId: user.organizationId },
  });

  if (!existingDeal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const updatedDeal = await prisma.deal.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updatedDeal);
}