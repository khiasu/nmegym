// Seed script - creates default admin user and sample data
// Run with: node prisma/seed.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding NME GYM database...\n');

  // 1. Create Admin User
  const adminHash = await bcrypt.hash('nme2025', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nmegym.in' },
    update: {},
    create: {
      firstName: 'NME',
      lastName: 'Admin',
      phone: '+919863765861',
      email: 'admin@nmegym.in',
      passwordHash: adminHash,
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin user created: admin@nmegym.in / nme2025');

  // 2. Create Sample Members
  const memberHash = await bcrypt.hash('member123', 10);
  const sampleMembers = [
    { firstName: 'Vizo', lastName: 'Yhome', phone: '+919800111001', email: 'vizo@email.com', plan: 'ELITE', months: 12 },
    { firstName: 'Keviseno', lastName: 'Chishi', phone: '+919800122002', email: 'keviseno@email.com', plan: 'WARRIOR', months: 3 },
    { firstName: 'Theja', lastName: 'Sumi', phone: '+919800133003', email: 'theja@email.com', plan: 'STARTER', months: 1 },
    { firstName: 'Thinuo', lastName: 'Sangtam', phone: '+919800144004', email: 'thinuo@email.com', plan: 'WARRIOR', months: 3 },
    { firstName: 'Atola', lastName: 'Longkumer', phone: '+919800155005', email: 'atola@email.com', plan: 'ELITE', months: 12 },
    { firstName: 'Nzanthung', lastName: 'Kikon', phone: '+919800166006', email: 'nzanthung@email.com', plan: 'WARRIOR', months: 9 },
    { firstName: 'Mhalie', lastName: 'Chakhesang', phone: '+919800177007', email: 'mhalie@email.com', plan: 'STARTER', months: 1 },
  ];

  for (const m of sampleMembers) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 5));
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + m.months);
    const isExpired = endDate < new Date();

    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        firstName: m.firstName,
        lastName: m.lastName,
        phone: m.phone,
        email: m.email,
        passwordHash: memberHash,
        role: 'MEMBER'
      }
    });

    await prisma.membership.upsert({
      where: { id: user.id + '-membership' },
      update: {},
      create: {
        id: user.id + '-membership',
        userId: user.id,
        planTier: m.plan,
        status: isExpired ? 'EXPIRED' : 'ACTIVE',
        startDate,
        endDate
      }
    });

    // Create a verified payment for each
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: m.plan === 'ELITE' ? 7999 : m.plan === 'WARRIOR' ? 2499 : 999,
        paymentMethod: ['UPI', 'CASH', 'UPI'][Math.floor(Math.random() * 3)],
        status: 'VERIFIED',
        verifiedById: admin.id
      }
    }).catch(() => {}); // Ignore if duplicate
  }
  console.log(`✅ ${sampleMembers.length} sample members created`);

  // 3. Create Sample Bookings
  const bookings = [
    { name: 'Zhekuie Sema', phone: '+919800111222', interest: 'Weight Training', preferredTimeSlot: 'Morning' },
    { name: 'Limatula Yaden', phone: '+919800133444', interest: 'Zumba', preferredTimeSlot: 'Evening' },
    { name: 'Imkong Jamir', phone: '+919800155666', interest: 'General Fitness', preferredTimeSlot: 'Morning' },
  ];

  for (const b of bookings) {
    await prisma.booking.create({
      data: {
        name: b.name,
        phone: b.phone,
        interest: b.interest,
        preferredDate: new Date(Date.now() + Math.floor(Math.random() * 7) * 86400000),
        preferredTimeSlot: b.preferredTimeSlot,
        status: Math.random() > 0.5 ? 'CONFIRMED' : 'PENDING'
      }
    }).catch(() => {});
  }
  console.log('✅ Sample bookings created');

  // 4. Create Sample Posts
  const posts = [
    { title: "The Beginner's High-Protein Meal Plan", category: 'Diet Plan', content: 'Start your fitness journey with the right nutrition. This meal plan covers breakfast, lunch, dinner and snacks optimized for muscle building.' },
    { title: 'What To Eat 2 Hours Before Training', category: 'Pre-Workout', content: 'Fuel your workout properly. Learn about the ideal macronutrient ratios and meal timing for peak performance at the gym.' },
    { title: 'Cutting Without Losing Muscle: The NME Way', category: 'Fat Loss', content: 'Our proven approach to cutting fat while preserving lean muscle mass. Includes calorie calculations and supplement recommendations.' },
  ];

  for (const p of posts) {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await prisma.post.upsert({
      where: { slug },
      update: {},
      create: {
        title: p.title,
        slug,
        category: p.category,
        content: p.content
      }
    });
  }
  console.log('✅ Sample blog posts created');

  // 5. Create Pending Payments
  const pendingPayments = [
    { name: 'Visier Meyase', phone: '+919800188008', plan: 'WARRIOR', amount: 2499, method: 'UPI' },
    { name: 'Lhounii Ao', phone: '+919800199009', plan: 'STARTER', amount: 999, method: 'UPI' },
    { name: 'Keduoli Zhimomi', phone: '+919800100010', plan: 'ELITE', amount: 7999, method: 'UPI' },
  ];

  for (const pp of pendingPayments) {
    const parts = pp.name.split(' ');
    const user = await prisma.user.upsert({
      where: { phone: pp.phone },
      update: {},
      create: {
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
        phone: pp.phone,
        email: `${parts[0].toLowerCase()}@email.com`,
        passwordHash: memberHash,
        role: 'MEMBER'
      }
    });

    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: pp.amount,
        paymentMethod: pp.method,
        status: 'PENDING_VERIFICATION'
      }
    }).catch(() => {});
  }
  console.log('✅ Pending payment records created');

  console.log('\n🎉 Seed complete! Server ready to launch.');
  console.log('   Admin login: admin@nmegym.in / nme2025');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
