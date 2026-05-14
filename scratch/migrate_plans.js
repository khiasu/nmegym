
const prisma = require('../src/lib/prisma');

async function migrate() {
  console.log('🔄 Migrating old plan names to new system...');

  // Update memberships
  const m1 = await prisma.membership.updateMany({
    where: { planTier: 'ELITE' },
    data: { planTier: '1 Year' }
  });
  console.log(`✅ Updated ${m1.count} ELITE memberships to 1 Year`);

  const m2 = await prisma.membership.updateMany({
    where: { planTier: 'WARRIOR' },
    data: { planTier: '6 Months' }
  });
  console.log(`✅ Updated ${m2.count} WARRIOR memberships to 6 Months`);

  const m3 = await prisma.membership.updateMany({
    where: { planTier: 'STARTER' },
    data: { planTier: 'Monthly' }
  });
  console.log(`✅ Updated ${m3.count} STARTER memberships to Monthly`);

  // Update plans table
  const p1 = await prisma.plan.updateMany({
    where: { name: 'Elite' },
    data: { name: '1 Year' }
  });
  const p2 = await prisma.plan.updateMany({
    where: { name: 'Warrior' },
    data: { name: '6 Months' }
  });
  const p3 = await prisma.plan.updateMany({
    where: { name: 'Starter' },
    data: { name: 'Monthly' }
  });
  
  console.log('🎉 Migration complete!');
}

migrate()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
