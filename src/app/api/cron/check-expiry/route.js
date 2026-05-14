// src/app/api/cron/check-expiry/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendExpiryReminderEmail } from "@/lib/mail";

// This route should be pinged daily by a cron job service (e.g. cron-job.org, Vercel cron, etc.)
export async function GET(request) {
  try {
    // Optional: add basic authorization header check here if using a third-party cron service
    // if (request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    // 1. Find memberships expiring in 5 days that haven't been reminded yet
    const expiringIn5Days = await prisma.membership.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: fiveDaysFromNow,
          lt: new Date(fiveDaysFromNow.getTime() + 24 * 60 * 60 * 1000), // Within that 5th day
        },
        reminder5DaySent: false,
      },
      include: { user: true },
    });

    // 2. Find memberships expiring in 1 day that haven't been reminded yet
    const expiringIn1Day = await prisma.membership.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: oneDayFromNow,
          lt: new Date(oneDayFromNow.getTime() + 24 * 60 * 60 * 1000), // Within that 1st day
        },
        reminder1DaySent: false,
      },
      include: { user: true },
    });

    // Process 5-day reminders
    for (const membership of expiringIn5Days) {
      if (membership.user?.email) {
        await sendExpiryReminderEmail(membership.user.email, membership.user.firstName, 5, membership.endDate);
        await prisma.membership.update({
          where: { id: membership.id },
          data: { reminder5DaySent: true },
        });
      }
    }

    // Process 1-day reminders
    for (const membership of expiringIn1Day) {
      if (membership.user?.email) {
        await sendExpiryReminderEmail(membership.user.email, membership.user.firstName, 1, membership.endDate);
        await prisma.membership.update({
          where: { id: membership.id },
          data: { reminder1DaySent: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent: {
        fiveDay: expiringIn5Days.length,
        oneDay: expiringIn1Day.length
      }
    });
  } catch (error) {
    console.error("Cron expiry check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
