import prisma from "./src/lib/prisma.js";

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" }
  });
  console.log("All Admins in DB:", admins.map(a => ({ id: a.id, email: a.email, hasHash: !!a.passwordHash })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
