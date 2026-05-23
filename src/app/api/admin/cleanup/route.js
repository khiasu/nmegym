// src/app/api/admin/cleanup/route.js
// One-time cleanup endpoint — removes all sample/test data from the database
// This endpoint requires admin authentication
// DELETE all sample members, testimonials, sample trainers, blog posts, and offers

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// Sample test emails from seed.js
const SAMPLE_EMAILS = [
  'vizo@email.com',
  'keviseno@email.com',
  'theja@email.com',
  'thinuo@email.com',
  'atola@email.com',
  'nzanthung@email.com',
  'mhalie@email.com',
  'visier@email.com',
  'lhounii@email.com',
  'keduoli@email.com',
];

// Sample trainer names from seed.js
const SAMPLE_TRAINER_NAMES = [
  'Keneizetuo Angami',
  'Lhouvi-o',
];

export async function POST(request) {
  try {
    // Require admin session
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      usersRemoved: 0,
      membershipsRemoved: 0,
      paymentsRemoved: 0,
      testimonialsRemoved: 0,
      trainersRemoved: 0,
      postsRemoved: 0,
      offersRemoved: 0,
    };

    // 1. Remove sample members and all their related data
    for (const email of SAMPLE_EMAILS) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) continue;

      const delTesti = await prisma.testimonial.deleteMany({ where: { userId: user.id } });
      results.testimonialsRemoved += delTesti.count;

      const delMemb = await prisma.membership.deleteMany({ where: { userId: user.id } });
      results.membershipsRemoved += delMemb.count;

      const delPay = await prisma.payment.deleteMany({ where: { userId: user.id } });
      results.paymentsRemoved += delPay.count;

      await prisma.user.delete({ where: { id: user.id } });
      results.usersRemoved++;
    }

    // 2. Remove sample trainers
    for (const name of SAMPLE_TRAINER_NAMES) {
      const trainer = await prisma.trainer.findFirst({ where: { name } });
      if (!trainer) continue;
      await prisma.trainer.delete({ where: { id: trainer.id } });
      results.trainersRemoved++;
    }

    // 3. Remove all blog posts
    const delPosts = await prisma.post.deleteMany({});
    results.postsRemoved = delPosts.count;

    // 4. Remove all offers
    const delOffers = await prisma.offer.deleteMany({});
    results.offersRemoved = delOffers.count;

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      results,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed', details: error.message }, { status: 500 });
  }
}
