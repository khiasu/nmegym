// src/app/admin/page.js — Admin Verification Panel
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();

  // Protect route: Only ADMIN can access
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch all management data in parallel
  const [
    pendingPayments, settings, trainers, plans, offers,
    members, verifiedPayments, facilities, bookings
  ] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "PENDING_VERIFICATION" },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, memberships: true } } },
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
      include: { user: { select: { firstName: true, lastName: true, memberships: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.facility.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.booking.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="admin-container">
      <AdminClient 
        pendingPayments={pendingPayments} 
        settings={settings}
        trainers={trainers}
        plans={plans}
        offers={offers}
        members={members}
        verifiedPayments={verifiedPayments}
        facilities={facilities}
        bookings={bookings}
      />
    </div>
  );
}
