// src/app/auth/register/page.js
import prisma from "@/lib/prisma";
import JoinForm from "./JoinForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const settings = await prisma.settings.findFirst();
  return <JoinForm settings={settings} />;
}
