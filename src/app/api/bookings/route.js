// src/app/api/bookings/route.js — Booking form API
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, age, interest, preferredDate, preferredTimeSlot, message } = body;

    if (!name || !phone || !interest) {
      return NextResponse.json(
        { error: "Name, phone, and interest are required." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        name,
        phone,
        age: age ? parseInt(age) : null,
        interest,
        preferredDate: preferredDate ? new Date(preferredDate) : new Date(),
        preferredTimeSlot: preferredTimeSlot || "Morning (6 AM – 9 AM)",
        message: message || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking. Please try again." },
      { status: 500 }
    );
  }
}
