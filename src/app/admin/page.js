// src/app/admin/page.js — Admin Verification Panel
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();

  // Protect route: Redirect to login if not authenticated
  if (!session) {
    return redirect("/auth/login?callbackUrl=/admin");
  }

  // Redirect to home if not an ADMIN
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch all management data in parallel
  const [
    allPendingPayments, settings, trainers, plans, offers,
    members, verifiedPayments, facilities
  ] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "PENDING_VERIFICATION" },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, memberId: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.settings.findFirst(),
    prisma.trainer.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.plan.findMany({ orderBy: { price: "asc" } }),
    prisma.offer.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({
      where: { role: "MEMBER" },
      include: { memberships: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { status: "VERIFIED" },
      include: { user: { select: { firstName: true, lastName: true, memberId: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.facility.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  // Split pending payments: new registrations vs existing member renewals
  const newRegistrations = allPendingPayments.filter(p => p.isFirstTimer);
  const pendingRenewals = allPendingPayments.filter(p => !p.isFirstTimer);

  // Serialize Decimal fields for Client Components
  const serialize = (payments) => payments.map(p => ({
    ...p,
    amount: Number(p.amount),
    admissionFee: p.admissionFee ? Number(p.admissionFee) : 0,
  }));

  const serializedSettings = settings ? {
    ...settings,
    updatedAt: settings.updatedAt.toISOString(),
  } : null;

  return (
    <div className="admin-container">
      <AdminClient 
        newRegistrations={serialize(newRegistrations)}
        pendingPayments={serialize(pendingRenewals)}
        verifiedPayments={serialize(verifiedPayments)}
        settings={serializedSettings}
        trainers={trainers}
        plans={plans}
        offers={offers}
        members={members}
        facilities={facilities}
      />
    </div>
  );
}
