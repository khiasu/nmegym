// src/app/api/auth/join/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
          email,
          phone,
          role: "MEMBER",
        },
      });
    }

    // Create payment request
    const amountMap = { "MONTHLY": 999, "3_MONTHS": 2499, "6_MONTHS": 4499, "ANNUAL": 7999 };
    const planNameMap = {
      "MONTHLY": "Monthly Plan",
      "3_MONTHS": "3 Months Plan",
      "6_MONTHS": "6 Months Plan",
      "ANNUAL": "1 Year Plan",
    };
    const planName = planNameMap[plan] || "Membership Plan";
    
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: amountMap[plan] || 0,
        planName,
        isFirstTimer: true,
        paymentMethod: "UPI",
        screenshotUrl,
        status: "PENDING_VERIFICATION",
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Join request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
