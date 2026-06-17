// src/app/api/admin/backfill-member-ids/route.js
// One-time utility to assign member IDs to existing members who are missing them
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { backfillMissingMemberIds } from "@/lib/member-utils";

export async function POST() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await backfillMissingMemberIds();

    return NextResponse.json({
      success: true,
      message: `Assigned member IDs to ${count} member(s).`,
      count,
    });
  } catch (error) {
    console.error("BACKFILL_MEMBER_IDS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
