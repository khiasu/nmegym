// src/app/api/admin/plans/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, name, price, period, badge } = await request.json();

    if (id) {
      const updated = await prisma.plan.update({
        where: { id },
        data: { name, price, period, badge },
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.plan.create({
        data: { name, price, period, badge },
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("Plan save error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Plan ID required" }, { status: 400 });

    await prisma.plan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Plan delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
