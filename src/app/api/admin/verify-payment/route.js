// src/app/api/admin/verify-payment/route.js
// Handles payment verification by admin:
// - VERIFIED: activates membership, generates member ID + password for first-timers
// - REJECTED: marks payment as rejected
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Generate a sequential human-readable member ID like NME-001, NME-002, etc.
 */
async function generateMemberId() {
  const lastUser = await prisma.user.findFirst({
    where: { memberId: { not: null } },
    orderBy: { memberId: "desc" },
  });

  let nextNumber = 1;
  if (lastUser?.memberId) {
    const match = lastUser.memberId.match(/NME-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `NME-${String(nextNumber).padStart(3, "0")}`;
}

/**
 * Generate a random 8-character password
 */
function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId, status } = await request.json();

    if (!paymentId || !status) {
      return NextResponse.json({ error: "Payment ID and status are required" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        verifiedById: session.user.id,
      },
    });

    if (status === "VERIFIED") {
      const user = payment.user;
      const isFirstTimer = payment.isFirstTimer;

      // --- Generate Member ID if user doesn't have one ---
      let memberId = user.memberId;
      if (!memberId) {
        memberId = await generateMemberId();
        await prisma.user.update({
          where: { id: user.id },
          data: { memberId },
        });
      }

      // --- Generate password for first-timers (users without a password) ---
      let initialPassword = null;
      if (!user.passwordHash) {
        initialPassword = generatePassword();
        const hashedPw = await bcrypt.hash(initialPassword, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: hashedPw },
        });
      }

      // --- Handle membership ---
      const startDate = new Date();
      const endDate = new Date();
      
      // Determine duration based on plan name
      const planLower = (payment.planName || "").toLowerCase();
      if (planLower.includes("year") || planLower.includes("12")) {
        endDate.setFullYear(startDate.getFullYear() + 1);
      } else if (planLower.includes("6")) {
        endDate.setMonth(startDate.getMonth() + 6);
      } else if (planLower.includes("3")) {
        endDate.setMonth(startDate.getMonth() + 3);
      } else {
        // Default: 1 month
        endDate.setMonth(startDate.getMonth() + 1);
      }

      const existingMembership = await prisma.membership.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      const planTier = payment.planName || "MEMBER";

      if (existingMembership) {
        await prisma.membership.update({
          where: { id: existingMembership.id },
          data: { status: "ACTIVE", planTier, startDate, endDate },
        });
      } else {
        await prisma.membership.create({
          data: {
            userId: user.id,
            status: "ACTIVE",
            planTier,
            startDate,
            endDate,
          },
        });
      }

      // --- Send emails ---
      if (initialPassword) {
        // New member: send welcome email with credentials
        const { sendWelcomeEmail } = await import("@/lib/mail");
        await sendWelcomeEmail(user.email, user.firstName, memberId, initialPassword);
      } else {
        // Existing member: send payment confirmation email
        const { sendPaymentConfirmationEmail } = await import("@/lib/mail");
        await sendPaymentConfirmationEmail(
          user.email,
          user.firstName,
          payment.planName,
          Number(payment.amount),
          memberId
        );
      }

      return NextResponse.json({
        success: true,
        memberId,
        isNewMember: !!initialPassword,
      });
    }

    // REJECTED case
    return NextResponse.json({ success: true, status: "REJECTED" });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
