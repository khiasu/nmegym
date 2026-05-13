// src/app/dashboard/page.js — Member Dashboard
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

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

  // Fetch available plans for renewal
  const plans = await prisma.plan.findMany();

  return (
    <div className="dashboard-container">
      <DashboardClient user={user} plans={plans} />
    </div>
  );
}
