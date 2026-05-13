// src/app/api/payments/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, paymentMethod, screenshotUrl } = await request.json();

    if (!amount || !screenshotUrl) {
      return NextResponse.json({ error: "Amount and screenshot are required" }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount,
        paymentMethod: paymentMethod || "UPI",
        screenshotUrl,
        status: "PENDING_VERIFICATION",
      },
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
