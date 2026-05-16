// src/app/auth/forgot-password/page.js
import prisma from "@/lib/prisma";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const settings = await prisma.settings.findFirst();
  return <ForgotPasswordForm settings={settings} />;
}
