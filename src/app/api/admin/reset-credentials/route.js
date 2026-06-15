import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/member-utils";

export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const initialPassword = generatePassword();
    const hashedPw = await bcrypt.hash(initialPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPw,
        mustChangePassword: true
      }
    });

    return NextResponse.json({
      success: true,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      memberId: updatedUser.memberId,
      phone: updatedUser.phone,
      email: updatedUser.email,
      initialPassword
    });
  } catch (error) {
    console.error("RESET_CREDENTIALS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
