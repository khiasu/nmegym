// src/app/api/admin/plans/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, name, price, period, features } = await request.json();

    if (id) {
      const updated = await prisma.plan.update({
        where: { id },
        data: { name, price, period, features },
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.plan.create({
        data: { name, price, period, features },
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("Plan save error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
