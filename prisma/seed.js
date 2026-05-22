// Seed script - creates default admin user and sample data
// Run with: node prisma/seed.js
// Requires: DATABASE_URL in .env pointing to Neon PostgreSQL

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
  const admin = await prisma.user.upsert({
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

  // 2. Create Sample Members
  const memberHash = await bcrypt.hash('member123', 10);
  const sampleMembers = [
    { firstName: 'Vizo', lastName: 'Yhome', phone: '+919800111001', email: 'vizo@email.com', plan: '1 Year', months: 12 },
    { firstName: 'Keviseno', lastName: 'Chishi', phone: '+919800122002', email: 'keviseno@email.com', plan: '3 Months', months: 3 },
    { firstName: 'Theja', lastName: 'Sumi', phone: '+919800133003', email: 'theja@email.com', plan: 'Monthly', months: 1 },
    { firstName: 'Thinuo', lastName: 'Sangtam', phone: '+919800144004', email: 'thinuo@email.com', plan: '6 Months', months: 6 },
    { firstName: 'Atola', lastName: 'Longkumer', phone: '+919800155005', email: 'atola@email.com', plan: '1 Year', months: 12 },
    { firstName: 'Nzanthung', lastName: 'Kikon', phone: '+919800166006', email: 'nzanthung@email.com', plan: '6 Months', months: 6 },
    { firstName: 'Mhalie', lastName: 'Chakhesang', phone: '+919800177007', email: 'mhalie@email.com', plan: 'Monthly', months: 1 },
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

    // Use a deterministic membership ID based on user ID
    const membershipId = `${user.id}-membership`;
    const existingMembership = await prisma.membership.findUnique({ where: { id: membershipId } });
    if (!existingMembership) {
      await prisma.membership.create({
        data: {
          id: membershipId,
          userId: user.id,
          planTier: m.plan,
          status: isExpired ? 'EXPIRED' : 'ACTIVE',
          startDate,
          endDate
        }
      });
    }

    // Create a verified payment for each
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: m.plan === '1 Year' ? 7999 : m.plan === '6 Months' ? 4499 : m.plan === '3 Months' ? 2499 : 999,
        paymentMethod: ['UPI', 'CASH', 'UPI'][Math.floor(Math.random() * 3)],
        status: 'VERIFIED',
        verifiedById: admin.id
      }
    }).catch(() => {}); // Ignore if duplicate
  }
  console.log(`✅ ${sampleMembers.length} sample members created`);

  // 2b. Seed Testimonials for Sample Members
  const testimonialData = {
    'vizo@email.com': "I lost 14 kg in 4 months. The trainers at NME didn't just give me a workout — they gave me a lifestyle change.",
    'keviseno@email.com': "As a working woman in Chumoukedima, I needed flexible hours and real results. NME delivered both. The training sessions are incredible!",
    'theja@email.com': "Best gym in Nagaland. No nonsense, clean equipment, and trainers who actually track your progress. Highly recommend the Elite plan.",
    'thinuo@email.com': "I was nervous starting. Walked into NME and everyone was welcoming. Within 3 months I'm deadlifting twice my body weight.",
    'atola@email.com': "The diet plans they gave me changed everything. Combined with the training, I'm in the best shape of my life at 32.",
    'nzanthung@email.com': "NME is more than a gym — it's a community. Everyone pushes each other. The energy here is unlike anything in Nagaland.",
  };

  for (const [email, content] of Object.entries(testimonialData)) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const existing = await prisma.testimonial.findFirst({
        where: { userId: user.id }
      });
      if (!existing) {
        await prisma.testimonial.create({
          data: {
            userId: user.id,
            content,
            rating: 5,
            isPublic: true
          }
        });
      }
    }
  }
  console.log('✅ Sample testimonials seeded');

  // 3. Create Sample Bookings
  const bookings = [
    { name: 'Zhekuie Sema', phone: '+919800111222', interest: 'Weight Training', preferredTimeSlot: 'Morning' },
    { name: 'Limatula Yaden', phone: '+919800133444', interest: 'Cardio', preferredTimeSlot: 'Evening' },
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
    { name: 'Visier Meyase', phone: '+919800188008', plan: '3 Months', amount: 2499, method: 'UPI' },
    { name: 'Lhounii Ao', phone: '+919800199009', plan: 'Monthly', amount: 999, method: 'UPI' },
    { name: 'Keduoli Zhimomi', phone: '+919800100010', plan: '1 Year', amount: 7999, method: 'UPI' },
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

  // 6. Create Sample Trainers
  const trainers = [
    { name: 'Keneizetuo Angami', role: 'Head Coach', bio: 'Certified S&C specialist with 10+ years experience in bodybuilding.', quote: 'Discipline is the bridge between goals and accomplishment.', imageUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80' },
    { name: 'Lhouvi-o', role: 'Strength Coach', bio: 'Expert in powerlifting and functional strength.', quote: 'Be stronger than your excuses.', imageUrl: 'https://images.unsplash.com/photo-1549476464-37392f71752a?w=400&q=80' }
  ];

  for (const t of trainers) {
    const existing = await prisma.trainer.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.trainer.create({ data: t });
    } else {
      await prisma.trainer.update({ where: { id: existing.id }, data: t });
    }
  }
  console.log('✅ Trainers created/updated');

  // 7. Create Sample Facilities
  const facilities = [
    { name: 'Strength Area', description: 'Premium free weights and heavy-duty machines.', mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', mediaType: 'IMAGE' },
    { name: 'Personal Training Area', description: 'Dedicated space for one-on-one coaching and body transformation.', mediaUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', mediaType: 'IMAGE' },
    { name: 'Cardio Deck', description: 'Latest treadmills and rowers for endurance.', mediaUrl: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800&q=80', mediaType: 'IMAGE' }
  ];

  for (const f of facilities) {
    await prisma.facility.create({ data: f }).catch(() => {});
  }
  console.log('✅ Facilities created');

  // 8. Create Default Plans
  const plans = [
    { name: 'Monthly', price: 999, period: 'month', features: 'Gym Access,Locker Facility,Basic Assessment' },
    { name: '3 Months', price: 2499, period: 'quarter', features: 'Gym Access,Locker + Towel,Full Assessment' },
    { name: '6 Months', price: 4499, period: 'half year', features: 'Everything in 3m,Group Classes,Diet Plan' },
    { name: '1 Year', price: 7999, period: 'year', features: 'Everything in 6m,Personal Trainer (8 sessions),Monthly Analysis' }
  ];

  for (const { features, ...planData } of plans) {
    await prisma.plan.upsert({
      where: { name: planData.name },
      update: planData,
      create: planData
    });
  }
  console.log('✅ Plans seeded');

  // 9. Create Sample Offer
  await prisma.offer.create({
    data: {
      title: 'Christmas Blast',
      badge: 'Special',
      discount: 20,
      description: 'Get 20% off on all annual memberships this December!',
      isActive: true
    }
  }).catch(() => {});
  console.log('✅ Sample offer created');

  // 10. Create Default Settings
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      gymName: 'NME GYM',
      logoUrl: '/newlogo.png',
      address: 'Chumoukedima, Nagaland',
      whatsappNumber: '+91 98637 65861',
      email: 'nmegym.india@gmail.com',
      instagramUrl: 'https://www.instagram.com/nme_gym'
    }
  });
  console.log('✅ Default settings created');

  console.log('\n🎉 Seed complete! Database is ready.');
  console.log('   Admin login: nmegym.india@gmail.com / nme2026');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
