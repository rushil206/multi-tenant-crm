import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, organizationName } = body;

    // Basic validation
    if (!name || !email || !password || !organizationName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password (never store it as plain text)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the Organization AND the first User (who becomes OWNER) together
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