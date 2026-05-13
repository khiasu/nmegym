// src/app/api/admin/verify-payment/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId, status } = await request.json();

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { 
        status,
        verifiedById: session.user.id,
      },
    });

    if (status === "VERIFIED") {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      // Generate a temporary password if user doesn't have one
      let initialPassword = null;
      if (!payment.user.passwordHash) {
        initialPassword = Math.random().toString(36).slice(-8);
        const hashedPw = await bcrypt.hash(initialPassword, 10);
        await prisma.user.update({
          where: { id: payment.userId },
          data: { passwordHash: hashedPw },
        });
      }

      // Handle membership
      const existingMembership = await prisma.membership.findFirst({
        where: { userId: payment.userId },
        orderBy: { createdAt: "desc" },
      });

      if (existingMembership) {
        await prisma.membership.update({
          where: { id: existingMembership.id },
          data: { status: "ACTIVE", startDate, endDate },
        });
      } else {
        await prisma.membership.create({
          data: { userId: payment.userId, status: "ACTIVE", planTier: "MEMBER", startDate, endDate },
        });
      }

      // Send Email if we generated a password
      if (initialPassword) {
        const { sendWelcomeEmail } = await import("@/lib/mail");
        await sendWelcomeEmail(
          payment.user.email,
          payment.user.firstName,
          payment.userId.slice(-6).toUpperCase(),
          initialPassword
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
