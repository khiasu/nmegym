// Cleanup script - wipes all members and payment history before client handover
// Run with: node prisma/cleanup.js
// Requires: DATABASE_URL in .env pointing to Neon PostgreSQL

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

async function main() {
  console.log('🧹 Starting NME GYM database cleanup (Wiping Members and Payments)...\n');

  // 1. Delete all testimonials
  const delTesti = await prisma.testimonial.deleteMany({});
  console.log(`  ✅ Removed ${delTesti.count} testimonials`);

  // 2. Delete all memberships
  const delMemb = await prisma.membership.deleteMany({});
  console.log(`  ✅ Removed ${delMemb.count} memberships`);

  // 3. Delete all payment records
  const delPay = await prisma.payment.deleteMany({});
  console.log(`  ✅ Removed ${delPay.count} payment records`);

  // 4. Delete all users with role MEMBER
  const delU = await prisma.user.deleteMany({
    where: {
      role: 'MEMBER'
    }
  });
  console.log(`  ✅ Removed ${delU.count} member accounts`);

  console.log('\n🎉 Cleanup complete!');
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  const trainerCount = await prisma.trainer.count();
  const planCount = await prisma.plan.count();
  const facilityCount = await prisma.facility.count();
  const offerCount = await prisma.offer.count();
  const settingsCount = await prisma.settings.count();

  console.log(`   Remaining Admin Accounts: ${adminCount}`);
  console.log(`   Remaining Trainers: ${trainerCount}`);
  console.log(`   Remaining Plans: ${planCount}`);
  console.log(`   Remaining Facilities: ${facilityCount}`);
  console.log(`   Remaining Offers: ${offerCount}`);
  console.log(`   Remaining Settings Records: ${settingsCount}`);
}

main()
  .catch((e) => {
    console.error('Cleanup error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
