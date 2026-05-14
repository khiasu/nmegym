// src/app/api/admin/members/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const members = await prisma.user.findMany({
      where: { role: "MEMBER" },
      include: {
        memberships: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(members);
  } catch (error) {
    return new NextResponse("Database Error", { status: 500 });
  }
}

export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, planTier, startDate } = body;

    // 1. Create or Update User
    const user = await prisma.user.upsert({
      where: { email },
      update: { firstName, lastName, phone, role: "MEMBER" },
      create: { firstName, lastName, email, phone, role: "MEMBER" }
    });

    // 2. Create Membership
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    
    // Simple logic for duration based on planTier (if we want to automate)
    // For now just 1 month default if not specified
    end.setMonth(end.getMonth() + 1);

    await prisma.membership.create({
      data: {
        userId: user.id,
        planTier,
        status: "ACTIVE",
        startDate: start,
        endDate: end
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("MEMBER_CREATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("id");

    if (!memberId) return new NextResponse("Missing ID", { status: 400 });

    await prisma.user.delete({
      where: { id: memberId }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
