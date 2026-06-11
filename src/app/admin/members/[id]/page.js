// src/app/admin/members/[id]/page.js
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import MemberProfileClient from "./MemberProfileClient";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage({ params }) {
  const session = await auth();

  if (!session) {
    return redirect("/auth/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  // Fetch member with ALL memberships and payments
  const member = await prisma.user.findUnique({
    where: { id },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" }
      },
      payments: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!member || member.role !== "MEMBER") {
    return (
      <div className="admin-container" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "white" }}>Member Not Found</h2>
        <Link href="/admin?tab=members" className="admin-btn-sm" style={{ display: "inline-block", marginTop: "20px" }}>
          Back to Admin Portal
        </Link>
      </div>
    );
  }

  // Fetch available plans for the edit form
  const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } });

  // Fetch settings for gym name
  const settings = await prisma.settings.findFirst();

  // Serialize Decimal fields from payments
  const serializedMember = {
    ...member,
    payments: member.payments.map(p => ({
      ...p,
      amount: Number(p.amount),
      admissionFee: p.admissionFee ? Number(p.admissionFee) : 0,
    })),
  };

  return (
    <div className="admin-container" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <MemberProfileClient member={serializedMember} plans={plans} settings={settings} />
    </div>
  );
}
