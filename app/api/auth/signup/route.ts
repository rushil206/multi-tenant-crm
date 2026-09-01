import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, organizationName, inviteToken } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // CASE 1: Signing up via an invitation — join an existing organization
    if (inviteToken) {
      const invitation = await prisma.invitation.findUnique({
        where: { token: inviteToken },
      });

      if (!invitation) {
        return NextResponse.json(
          { error: "Invalid invitation link" },
          { status: 400 }
        );
      }

      if (invitation.used) {
        return NextResponse.json(
          { error: "This invitation has already been used" },
          { status: 400 }
        );
      }

      if (invitation.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "This invitation has expired" },
          { status: 400 }
        );
      }

      // Create the user inside the EXISTING organization, with the role from the invite
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: invitation.role,
          organizationId: invitation.organizationId,
        },
      });

      // Mark the invitation as used so it can't be reused
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { used: true },
      });

      return NextResponse.json(
        { message: "Account created and joined organization", userId: user.id },
        { status: 201 }
      );
    }

    // CASE 2: Regular signup — create a brand NEW organization (existing behavior)
    if (!organizationName) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        users: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: "OWNER",
          },
        },
      },
      include: { users: true },
    });

    return NextResponse.json(
      { message: "Account created successfully", organizationId: organization.id },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}