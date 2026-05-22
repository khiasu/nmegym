// src/app/api/admin/trainers/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, role, bio, imageUrl, quote } = await request.json();

    if (id) {
      // Update
      const updated = await prisma.trainer.update({
        where: { id },
        data: { name, role, bio, imageUrl, quote },
      });
      return NextResponse.json(updated);
    } else {
      // Create
      const created = await prisma.trainer.create({
        data: { name, role, bio, imageUrl, quote },
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("Trainer save error:", error);
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

    await prisma.trainer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Trainer delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
