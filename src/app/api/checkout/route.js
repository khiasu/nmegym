// src/app/api/checkout/route.js — Handles both new member + existing member checkout
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendAdminNotificationEmail } from "@/lib/mail";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      planName,
      planPrice,
      admissionFee,
      totalAmount,
      screenshotUrl,
      isFirstTimer,
      userId, // null for first-timers who aren't logged in
    } = body;

    // Validation
    if (!email || !screenshotUrl || !planName) {
      return NextResponse.json(
        { error: "Email, plan, and screenshot are required" },
        { status: 400 }
      );
    }

    let targetUserId = userId;

    if (isFirstTimer && !userId) {
      // First-timer: Create or find the user (find by email OR phone)
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase().trim() },
            { phone: phone ? phone.trim() : undefined }
          ].filter(c => c.email || c.phone)
        },
      });

      if (existingUser) {
        // User already exists — just use their ID (they might be re-registering)
        targetUserId = existingUser.id;
        // Update their name/phone if provided
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            firstName: firstName || existingUser.firstName,
            lastName: lastName || existingUser.lastName,
            phone: phone || existingUser.phone,
          },
        });
      } else {
        // Create brand new user
        const newUser = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : null,
            role: "MEMBER",
          },
        });
        targetUserId = newUser.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Unable to identify user. Please provide valid details." },
        { status: 400 }
      );
    }

    // ── Rate Limit: Max 3 payment submissions per user per day ──────────────
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await prisma.payment.count({
      where: {
        userId: targetUserId,
        createdAt: { gte: startOfDay },
      },
    });

    if (todayCount >= 3) {
      return NextResponse.json(
        { error: "Daily submission limit reached. A maximum of 3 payment requests can be made per day per account. Contact support if you need help." },
        { status: 429 }
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: targetUserId,
        amount: totalAmount,
        planName,
        admissionFee: admissionFee || 0,
        isFirstTimer: isFirstTimer || false,
        paymentMethod: "UPI",
        screenshotUrl,
        status: "PENDING_VERIFICATION",
      },
    });

    // Send notification emails
    try {
      await Promise.allSettled([
        sendAdminNotificationEmail({
          memberName: `${firstName} ${lastName}`,
          email,
          phone,
          planName,
          totalAmount,
          isFirstTimer,
          paymentId: payment.id,
        }),
        import("@/lib/mail").then(({ sendUserPendingNotificationEmail }) => 
          sendUserPendingNotificationEmail(email, firstName, planName)
        )
      ]);
    } catch (emailErr) {
      // Don't fail the checkout if email fails
      console.error("Notification emails failed:", emailErr);
    }

    return NextResponse.json(
      { success: true, paymentId: payment.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
