// Seed script - creates admin user, plans, and default settings only
// Run with: node prisma/seed.js
// Requires: DATABASE_URL in .env pointing to Neon PostgreSQL
// NOTE: Sample members, testimonials, and test trainers have been removed.
//       Real trainers and members should be added through the admin portal.

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Use standard pg Pool with @prisma/adapter-pg — works reliably in Node.js
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding NME GYM database (Neon PostgreSQL)...\n');

  // 1. Create Admin User
  const adminHash = await bcrypt.hash('nme2026', 10);
  await prisma.user.upsert({
    where: { email: 'nmegym.india@gmail.com' },
    update: {},
    create: {
      firstName: 'NME',
      lastName: 'Admin',
      phone: '+919863765861',
      email: 'nmegym.india@gmail.com',
      passwordHash: adminHash,
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin user created: nmegym.india@gmail.com / nme2026');

  // 2. Create Default Plans
  const plans = [
    { name: '1 Month', price: 1500, period: 'month', badge: 'BASIC' },
    { name: '3 Months', price: 4000, period: 'quarter', badge: 'MOST POPULAR' },
    { name: '6 Months', price: 7500, period: 'half year', badge: 'BEST VALUE' },
    { name: '12 Months', price: 13000, period: 'year', badge: 'PRO ELITE' }
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: { price: plan.price, period: plan.period, badge: plan.badge },
      create: plan
    });
  }
  console.log('✅ Plans seeded');

  // 3. Create Default Settings
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      gymName: 'NME GYM',
      logoUrl: '/newlogo.png',
      address: 'Kemnbay Hostel 5th Mile, Diphupar B, Chumoukedima, Nagaland 797115',
      whatsappNumber: '+91 98637 65861',
      email: 'nmegym.india@gmail.com',
      instagramUrl: 'https://www.instagram.com/nme_gym',
      payPerSessionPrice: 200
    }
  });
  console.log('✅ Default settings created');

  console.log('\n🎉 Seed complete! Database is ready.');
  console.log('   Admin login: nmegym.india@gmail.com / nme2026');
  console.log('   Add trainers and members through the admin portal at /admin');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
