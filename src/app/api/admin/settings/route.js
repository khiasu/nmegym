// src/app/api/admin/settings/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const updated = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        gymName: data.gymName,
        logoUrl: data.logoUrl,
        whatsappNumber: data.whatsappNumber,
        email: data.email,
        address: data.address,
        instagramUrl: data.instagramUrl,
      },
      create: {
        id: 1,
        gymName: data.gymName,
        logoUrl: data.logoUrl,
        whatsappNumber: data.whatsappNumber,
        email: data.email,
        address: data.address,
        instagramUrl: data.instagramUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
