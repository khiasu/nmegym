// src/app/dashboard/page.js — Member Dashboard
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { Suspense } from "react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  // Fetch full user data including membership and payments
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Serialize Decimal fields for client component
  const serializedUser = {
    ...user,
    payments: user.payments.map(p => ({
      ...p,
      amount: Number(p.amount),
      admissionFee: p.admissionFee ? Number(p.admissionFee) : 0,
    })),
  };

  // Fetch available plans for renewal
  const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } });

  // Fetch settings for UPI ID
  const settings = await prisma.settings.findFirst();

  // Fetch active offers for promo codes
  const offers = await prisma.offer.findMany({ where: { isActive: true } });

  return (
    <div className="dashboard-container">
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }}></div>}>
        <DashboardClient user={serializedUser} plans={plans} settings={settings} offers={offers} />
      </Suspense>
    </div>
  );
}
