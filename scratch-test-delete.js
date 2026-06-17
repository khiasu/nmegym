import prisma from "./src/lib/prisma.js";

async function main() {
  console.log("Creating a mock user to test deletion...");
  const testUser = await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "Delete",
      phone: "9999999990",
      email: "testdelete@example.com",
      role: "MEMBER"
    }
  });
  console.log("Created user:", testUser.id);

  // Add a membership
  await prisma.membership.create({
    data: {
      userId: testUser.id,
      planTier: "STARTER",
      status: "ACTIVE"
    }
  });

  // Add a payment
  await prisma.payment.create({
    data: {
      userId: testUser.id,
      amount: 1000,
      paymentMethod: "CASH"
    }
  });

  try {
    console.log("Trying to delete user...");
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log("Deletion successful! No constraints blocked it.");
  } catch (error) {
    console.error("Deletion failed with error:");
    console.error(error);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
