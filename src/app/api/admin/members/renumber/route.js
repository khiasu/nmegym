import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 1. Fetch all members
    const members = await prisma.user.findMany({
      where: { role: "MEMBER" },
      include: {
        memberships: {
          orderBy: { createdAt: "desc" },
        }
      }
    });

    // 2. Filter out session pass members (registered members only)
    const registeredMembers = members.filter(m => {
      const latestPlan = m.memberships?.[0]?.planTier?.toLowerCase() || "";
      return !(
        latestPlan.includes("session") ||
        latestPlan.includes("daily") ||
        latestPlan.includes("pass")
      );
    });

    // 3. Sort them exactly as they are displayed (ID numerically ascending, fallback to createdAt ascending)
    const sortedMembers = [...registeredMembers].sort((a, b) => {
      const numA = a.memberId ? parseInt((a.memberId.match(/NME-(\d+)/) || [])[1] || "0", 10) : 999999;
      const numB = b.memberId ? parseInt((b.memberId.match(/NME-(\d+)/) || [])[1] || "0", 10) : 999999;
      if (numA !== numB) {
        return numA - numB;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // 4. Temporarily set all memberIds to null to prevent uniqueness constraint violations during updates
    const memberUserIds = sortedMembers.map(m => m.id);
    await prisma.user.updateMany({
      where: { id: { in: memberUserIds } },
      data: { memberId: null }
    });

    // 5. Update each member ID sequentially starting from NME-001
    for (let i = 0; i < sortedMembers.length; i++) {
      const newId = `NME-${String(i + 1).padStart(3, "0")}`;
      await prisma.user.update({
        where: { id: sortedMembers[i].id },
        data: { memberId: newId }
      });
    }

    return NextResponse.json({ success: true, count: sortedMembers.length });
  } catch (error) {
    console.error("RENUMBER_MEMBERS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
