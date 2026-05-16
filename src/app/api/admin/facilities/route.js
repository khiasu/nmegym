// src/app/api/admin/facilities/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, description, mediaUrl, mediaType, tag } = await request.json();

    if (id) {
      // It's a real ID (from DB)
      const updated = await prisma.facility.update({
        where: { id },
        data: { name, description, mediaUrl, mediaType, tag },
      });
      return NextResponse.json(updated);
    } else {
      // Create
      const created = await prisma.facility.create({
        data: { name, description, mediaUrl, mediaType, tag },
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("Facility save error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const facilities = await prisma.facility.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(facilities);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.facility.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Facility delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
