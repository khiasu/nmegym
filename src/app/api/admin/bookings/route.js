// src/app/api/admin/bookings/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(bookings);
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status } = body;

    const booking = await prisma.booking.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(booking);
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.booking.delete({ where: { id } });
    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}
