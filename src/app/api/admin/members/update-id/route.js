import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { generateMemberId } from "@/lib/member-utils";

// GET: Generate and suggest the next available Member ID
export async function GET(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const nextId = await generateMemberId();
    return NextResponse.json({ nextId });
  } catch (error) {
    console.error("GET_NEXT_MEMBER_ID_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: Update Member ID for a specific user
export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { userId, newMemberId } = await req.json();

    if (!userId || !newMemberId) {
      return new NextResponse("User ID and New Member ID are required", { status: 400 });
    }

    // Format Validation: Must follow NME-XXX (e.g. NME-001)
    const idRegex = /^NME-\d+$/;
    if (!idRegex.test(newMemberId)) {
      return new NextResponse("Member ID must be in the format NME-XXX (e.g. NME-001, NME-013)", { status: 400 });
    }

    // Verify User exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check Uniqueness: Ensure the new memberId is not already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        memberId: newMemberId,
        id: { not: userId }
      }
    });

    if (existingUser) {
      return new NextResponse("Member ID is already assigned to another user", { status: 400 });
    }

    // Update member ID
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { memberId: newMemberId }
    });

    return NextResponse.json({
      success: true,
      memberId: updatedUser.memberId
    });
  } catch (error) {
    console.error("UPDATE_MEMBER_ID_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
