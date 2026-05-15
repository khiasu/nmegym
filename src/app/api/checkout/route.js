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
      // First-timer: Create or find the user (upsert by email)
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
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
        // Create brand new user (no password yet — will be generated on verification)
        const newUser = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email: email.toLowerCase().trim(),
            phone: phone || null,
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
