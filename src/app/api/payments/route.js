// src/app/api/payments/route.js — Authenticated member payment submissions
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { sendAdminNotificationEmail } from "@/lib/mail";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, planName, paymentMethod, screenshotUrl, promoCode } = await request.json();

    if (!amount || !screenshotUrl) {
      return NextResponse.json({ error: "Amount and screenshot are required" }, { status: 400 });
    }

    // ── Rate Limit: Max 3 payment submissions per user per day ──────────────
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await prisma.payment.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: startOfDay },
      },
    });

    if (todayCount >= 3) {
      return NextResponse.json(
        { error: "Daily limit reached. You can only submit 3 payment requests per day. Please contact support if you need assistance." },
        { status: 429 }
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, email: true, phone: true },
    });

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount,
        planName: planName || null,
        admissionFee: 0,
        isFirstTimer: false,
        promoCode: promoCode || null,
        paymentMethod: paymentMethod || "UPI",
        screenshotUrl,
        status: "PENDING_VERIFICATION",
      },
    });

    // Notify admin
    try {
      await sendAdminNotificationEmail({
        memberName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        planName: planName || "Monthly",
        totalAmount: amount,
        isFirstTimer: false,
        paymentId: payment.id,
      });
    } catch (emailErr) {
      console.error("Admin notification failed:", emailErr);
    }

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
