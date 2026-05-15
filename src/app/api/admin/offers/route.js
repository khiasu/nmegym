// src/app/api/admin/offers/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, title, badge, discount, isActive, promoImage } = await request.json();
    
    if (id) {
      const updated = await prisma.offer.update({
        where: { id },
        data: { title, badge, discount, isActive, promoImage },
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.offer.create({
        data: { title, badge, discount, isActive, promoImage },
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("Offer save error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await prisma.offer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
