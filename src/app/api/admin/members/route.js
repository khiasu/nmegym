// src/app/api/admin/members/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { generateMemberId, generatePassword } from "@/lib/member-utils";

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

    // Custom Plan / Normal Plan tier name
    const finalPlanTier = customPlanName ? `${customPlanName} (₹${customPlanPrice || 0})` : planTier;
    const planLower = (finalPlanTier || "").toLowerCase();
    const isSessionPass = planLower.includes("session") || planLower.includes("daily") || planLower.includes("pass");

    // Generate Member ID and temporary password if it's not a session pass
    let memberId = user.memberId;
    let initialPassword = null;

    if (!isSessionPass) {
      if (!memberId) {
        memberId = await generateMemberId();
        user = await prisma.user.update({
          where: { id: user.id },
          data: { memberId }
        });
      }

      if (!user.passwordHash) {
        initialPassword = generatePassword();
        const hashedPw = await bcrypt.hash(initialPassword, 10);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            passwordHash: hashedPw,
            mustChangePassword: true
          }
        });
      }
    }

    // 2. Expire any currently active memberships (preserves history)
    await prisma.membership.updateMany({
      where: { userId: user.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });

    // 3. Calculate dates
    const start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date(start);
    if (!endDate) {
      end.setMonth(end.getMonth() + 1);
    }

    // Check for duplicate history entry with identical plan details and dates
    const latestMembership = await prisma.membership.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    if (latestMembership) {
      const isDuplicate =
        latestMembership.planTier === (finalPlanTier || "STARTER") &&
        latestMembership.status === (status || "ACTIVE") &&
        latestMembership.startDate && new Date(latestMembership.startDate).getTime() === start.getTime() &&
        latestMembership.endDate && new Date(latestMembership.endDate).getTime() === end.getTime();

      if (isDuplicate) {
        // Update existing record with notes/etc. instead of duplicating
        await prisma.membership.update({
          where: { id: latestMembership.id },
          data: {
            notes: notes || latestMembership.notes
          }
        });

        return NextResponse.json({
          ...user,
          initialPassword,
          memberId,
          isNewMember: !!initialPassword
        });
      }
    }

    // 4. Create new Membership record
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

    return NextResponse.json({
      ...user,
      initialPassword,
      memberId,
      isNewMember: !!initialPassword
    });
  } catch (error) {
    console.error("MEMBER_CREATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      membershipId,
      planTier,
      customPlanName,
      customPlanPrice,
      startDate,
      endDate,
      notes,
      status 
    } = body;

    if (!membershipId) {
      return new NextResponse("Membership ID is required", { status: 400 });
    }

    // Custom Plan / Normal Plan tier name
    const finalPlanTier = customPlanName ? `${customPlanName} (₹${customPlanPrice || 0})` : planTier;

    // Calculate dates
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Update the membership record
    const updatedMembership = await prisma.membership.update({
      where: { id: membershipId },
      data: {
        planTier: finalPlanTier || "STARTER",
        status: status || "ACTIVE",
        startDate: start,
        endDate: end,
        notes: notes || null
      }
    });

    return NextResponse.json(updatedMembership);
  } catch (error) {
    console.error("MEMBERSHIP_UPDATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("id");

    if (!memberId) {
      return NextResponse.json({ error: "Missing member ID" }, { status: 400 });
    }

    // Parse password from body — wrapped in try/catch in case body is missing/invalid
    let password;
    try {
      const body = await req.json();
      password = body?.password;
    } catch (e) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "Admin password is required" }, { status: 401 });
    }

    // Verify admin password
    let adminUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    // Fallback for stale session ID
    if (!adminUser && session.user.email) {
      adminUser = await prisma.user.findFirst({
        where: { email: session.user.email.toLowerCase() }
      });
    }

    if (!adminUser || !adminUser.passwordHash) {
      return NextResponse.json({ error: "Admin account error or password not set. Try logging out and back in." }, { status: 500 });
    }

    const isValid = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 403 });
    }

    // Verify the member exists before attempting delete
    const memberToDelete = await prisma.user.findUnique({
      where: { id: memberId }
    });

    if (!memberToDelete) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Use a transaction to ensure cleanup + delete is atomic
    await prisma.$transaction(async (tx) => {
      // Disconnect any payments this user verified (verifiedById doesn't cascade)
      await tx.payment.updateMany({
        where: { verifiedById: memberId },
        data: { verifiedById: null }
      });

      // Explicitly delete related records that might not cascade properly
      await tx.testimonial.deleteMany({ where: { userId: memberId } });
      await tx.payment.deleteMany({ where: { userId: memberId } });
      await tx.membership.deleteMany({ where: { userId: memberId } });
      await tx.session.deleteMany({ where: { userId: memberId } });
      await tx.account.deleteMany({ where: { userId: memberId } });

      // Now delete the user
      await tx.user.delete({
        where: { id: memberId }
      });
    });

    return NextResponse.json({ success: true, message: "Member deleted" });
  } catch (error) {
    console.error("DELETE_MEMBER_ERROR", error);
    let errorMsg = error.message || "Failed to delete member";
    if (error.code === "P2003") {
      errorMsg = "Cannot delete member due to dependent records in the database (foreign key constraint error).";
    } else if (error.code === "P2025") {
      errorMsg = "Member record not found — it may have already been deleted.";
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
