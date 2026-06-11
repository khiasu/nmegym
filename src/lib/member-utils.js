import prisma from "./prisma";

/**
 * Generate a sequential human-readable member ID like NME-001, NME-002, etc.
 */
export async function generateMemberId() {
  const lastUser = await prisma.user.findFirst({
    where: { memberId: { not: null } },
    orderBy: { memberId: "desc" },
  });

  let nextNumber = 1;
  if (lastUser?.memberId) {
    const match = lastUser.memberId.match(/NME-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `NME-${String(nextNumber).padStart(3, "0")}`;
}

/**
 * Generate a random 8-character password
 */
export function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
