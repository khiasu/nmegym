// src/app/api/admin/members/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

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
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      planTier, 
      startDate, 
      endDate, 
      customPlanName, 
      customPlanPrice, 
      notes, 
      status 
    } = body;

    if (!firstName || !phone) {
      return new NextResponse("First Name and Phone are required", { status: 400 });
    }

    // 1. Find or Create User
    // If email is provided, prioritize looking up by email, otherwise look up by phone.
    let user = null;
    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }
    if (!user && phone) {
      user = await prisma.user.findUnique({ where: { phone } });
    }

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName,
          email: email || user.email,
          phone,
          role: "MEMBER"
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: email || null,
          phone,
          role: "MEMBER"
        }
      });
    }

    // 2. Create Membership
    const start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date(start);
    if (!endDate) {
      // Default: 1 month if no end date provided
      end.setMonth(end.getMonth() + 1);
    }

    // Custom Plan / Normal Plan tier name
    const finalPlanTier = customPlanName ? `${customPlanName} (₹${customPlanPrice || 0})` : planTier;

    await prisma.membership.create({
      data: {
        userId: user.id,
        planTier: finalPlanTier || "STARTER",
        status: status || "ACTIVE",
        startDate: start,
        endDate: end,
        notes: notes || null
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
    const { password } = await req.json();

    if (!memberId) return new NextResponse("Missing ID", { status: 400 });
    if (!password) return new NextResponse("Authorization required", { status: 401 });

    // Verify admin password
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!adminUser || !adminUser.passwordHash) {
      return new NextResponse("Admin account error", { status: 500 });
    }

    const isValid = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isValid) {
      return new NextResponse("Invalid admin password", { status: 401 });
    }

    await prisma.user.delete({
      where: { id: memberId }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
