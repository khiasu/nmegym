// src/app/api/auth/join/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendAdminNotificationEmail, sendUserPendingNotificationEmail } from "@/lib/mail";

export async function POST(request) {
  try {
    const { firstName, lastName, email, phone, plan, screenshotUrl } = await request.json();

    if (!email || !firstName || !lastName || !phone || !screenshotUrl) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user with no password yet (PENDING state)
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          phone: phone ? phone.trim() : null,
          role: "MEMBER",
        },
      });
    }

    // Find the plan in DB dynamically
    const dbPlan = await prisma.plan.findFirst({
      where: {
        OR: [
          { id: plan },
          { name: { equals: plan, mode: 'insensitive' } }
        ]
      }
    });

    const settings = await prisma.settings.findFirst().catch(() => null);
    const admissionFee = settings?.admissionFee !== undefined ? settings.admissionFee : 1000;
    
    let planPrice = 999;
    let planName = "Monthly Plan";
    if (dbPlan) {
      planPrice = dbPlan.price;
      planName = dbPlan.name;
    } else {
      // Fallbacks if not found
      const planNameMap = {
        "MONTHLY": "Monthly Plan",
        "3_MONTHS": "3 Months Plan",
        "6_MONTHS": "6 Months Plan",
        "ANNUAL": "1 Year Plan",
      };
      const amountMap = { "MONTHLY": 999, "3_MONTHS": 2499, "6_MONTHS": 4499, "ANNUAL": 7999 };
      if (amountMap[plan]) {
        planPrice = amountMap[plan];
        planName = planNameMap[plan];
      }
    }

    const totalAmount = planPrice + admissionFee;

    // Create payment request
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: totalAmount,
        planName,
        admissionFee: admissionFee,
        isFirstTimer: true,
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
          isFirstTimer: true,
          paymentId: payment.id,
          adminEmail: settings?.email || undefined,
        }),
        sendUserPendingNotificationEmail(email, firstName, planName)
      ]);
    } catch (emailErr) {
      console.error("Join route notification emails failed:", emailErr);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Join request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
