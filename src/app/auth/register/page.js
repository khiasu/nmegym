// src/app/auth/register/page.js
import prisma from "@/lib/prisma";
import JoinForm from "./JoinForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const [settings, plans] = await Promise.all([
    prisma.settings.findFirst(),
    prisma.plan.findMany({ orderBy: { price: "asc" } }),
  ]);
  return <JoinForm settings={settings} plans={plans} />;
}
