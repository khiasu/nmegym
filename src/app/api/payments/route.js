// src/app/api/payments/route.js — Authenticated member payment submissions
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { sendAdminNotificationEmail } from "@/lib/mail";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, planName, paymentMethod, screenshotUrl } = await request.json();

    if (!amount || !screenshotUrl) {
      return NextResponse.json({ error: "Amount and screenshot are required" }, { status: 400 });
    }

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
