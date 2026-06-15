// src/app/api/admin/membership-history/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const membershipId = searchParams.get("id");

    if (!membershipId) {
      return new NextResponse("Missing membership ID", { status: 400 });
    }

    // Fetch the membership to verify it exists
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
    });

    if (!membership) {
      return new NextResponse("Membership record not found", { status: 404 });
    }

    // Safety check: don't allow deleting the user's only ACTIVE membership
    if (membership.status === "ACTIVE") {
      // Count how many active memberships this user has
      const activeCount = await prisma.membership.count({
        where: { userId: membership.userId, status: "ACTIVE" },
      });

      if (activeCount <= 1) {
        return new NextResponse(
          "Cannot delete the only active membership. Change its status first or create a replacement.",
          { status: 400 }
        );
      }
    }

    // Delete the membership record only (not the user)
    await prisma.membership.delete({
      where: { id: membershipId },
    });

    return NextResponse.json({ success: true, deletedId: membershipId });
  } catch (error) {
    console.error("MEMBERSHIP_HISTORY_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
