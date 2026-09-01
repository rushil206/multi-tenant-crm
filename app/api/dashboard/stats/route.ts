import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { getUserFromRequest } from "@/app/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = user.organizationId;

  // Run all these counts/sums at the same time for speed
  const [totalLeads, totalCustomers, totalDeals, dealsWon, dealsLost, openDeals] =
    await Promise.all([
      prisma.lead.count({ where: { organizationId: orgId } }),
      prisma.customer.count({ where: { organizationId: orgId } }),
      prisma.deal.count({ where: { organizationId: orgId } }),
      prisma.deal.count({ where: { organizationId: orgId, status: "WON" } }),
      prisma.deal.count({ where: { organizationId: orgId, status: "LOST" } }),
      prisma.deal.aggregate({
        where: {
          organizationId: orgId,
          status: { notIn: ["WON", "LOST"] },
        },
        _sum: { value: true },
      }),
    ]);

  return NextResponse.json({
    totalLeads,
    totalCustomers,
    totalDeals,
    dealsWon,
    dealsLost,
    openPipelineValue: openDeals._sum.value || 0,
  });
}