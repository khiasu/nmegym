// Cleanup script - removes ALL sample/test data from the production database
// Run with: node prisma/cleanup.js
// Requires: DATABASE_URL in .env pointing to Neon PostgreSQL
// 
// This script removes:
//   - All sample members (non-admin, non-real users) and their memberships/payments
//   - All fake testimonials
//   - Sample trainers (Keneizetuo Angami, Lhouvi-o) — keeps real trainers
//   - All blog posts
//   - All offers (Christmas Blast etc.)
// 
// It KEEPS: Admin user, settings, plans, real trainers (Henok, Morjenbah Jamir), real members
// 
// IMPORTANT: Review the lists of emails/names to delete before running!

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================
// CONFIGURE THESE — emails of test/sample users to DELETE
// Admin and real users will be preserved automatically
// ============================================================
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

// Sample trainers to remove (real ones like Henok will NOT be in this list)
const SAMPLE_TRAINER_NAMES = [
  'Keneizetuo Angami',
  'Lhouvi-o',
];

// ============================================================

async function main() {
  console.log('🧹 Starting NME GYM database cleanup...\n');

  // 1. Remove sample members, their memberships, payments, and testimonials
  for (const email of SAMPLE_EMAILS) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`  ⏭  Skipping ${email} (not found)`);
      continue;
    }

    // Delete testimonials first (FK constraint)
    const delTesti = await prisma.testimonial.deleteMany({ where: { userId: user.id } });
    // Delete memberships
    const delMemb = await prisma.membership.deleteMany({ where: { userId: user.id } });
    // Delete payments
    const delPay = await prisma.payment.deleteMany({ where: { userId: user.id } });
    // Delete user
    await prisma.user.delete({ where: { id: user.id } });

    console.log(`  ✅ Removed user ${email} (${delTesti.count} testimonials, ${delMemb.count} memberships, ${delPay.count} payments)`);
  }

  // 2. Remove sample trainers
  for (const name of SAMPLE_TRAINER_NAMES) {
    const trainer = await prisma.trainer.findFirst({ where: { name } });
    if (!trainer) {
      console.log(`  ⏭  Trainer "${name}" not found — skipping`);
      continue;
    }
    await prisma.trainer.delete({ where: { id: trainer.id } });
    console.log(`  ✅ Removed trainer: ${name}`);
  }

  // 3. Remove all blog posts (sample content)
  const delPosts = await prisma.post.deleteMany({});
  console.log(`  ✅ Removed ${delPosts.count} blog posts`);

  // 4. Remove all offers (sample offers)
  const delOffers = await prisma.offer.deleteMany({});
  console.log(`  ✅ Removed ${delOffers.count} offers`);

  // 5. Summary
  console.log('\n🎉 Cleanup complete!');
  const trainerCount = await prisma.trainer.count();
  const memberCount = await prisma.user.count({ where: { role: 'MEMBER' } });
  const testiCount = await prisma.testimonial.count();
  console.log(`   Remaining trainers: ${trainerCount}`);
  console.log(`   Remaining members: ${memberCount}`);
  console.log(`   Remaining testimonials: ${testiCount}`);
}

main()
  .catch((e) => {
    console.error('Cleanup error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
