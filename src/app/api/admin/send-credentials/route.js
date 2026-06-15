import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { email, name, memberId, password } = await req.json();

    if (!email || !name || !memberId || !password) {
      return new NextResponse("Email, Name, Member ID and Password are required", { status: 400 });
    }

    await sendWelcomeEmail(email, name, memberId, password);

    return NextResponse.json({ success: true, message: "Credentials email sent successfully" });
  } catch (error) {
    console.error("SEND_CREDENTIALS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
