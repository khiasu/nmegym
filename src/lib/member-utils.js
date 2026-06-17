import prisma from "./prisma";

/**
 * Extract the numeric part from a member ID like "NME-042" → 42
 */
export function extractMemberIdNumber(memberId) {
  if (!memberId) return 0;
  const match = memberId.match(/NME-(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Generate a sequential human-readable member ID like NME-001, NME-002, etc.
 * Uses numeric comparison (not string sort) to find the highest existing ID.
 */
export async function generateMemberId() {
  // Fetch ALL existing member IDs and find the true maximum numerically
  const usersWithIds = await prisma.user.findMany({
    where: { memberId: { not: null } },
    select: { memberId: true },
  });

  let maxNumber = 0;
  for (const user of usersWithIds) {
    const num = extractMemberIdNumber(user.memberId);
    if (num > maxNumber) maxNumber = num;
  }

  const nextNumber = maxNumber + 1;
  return `NME-${String(nextNumber).padStart(3, "0")}`;
}

/**
 * Backfill missing member IDs for all MEMBER-role users who don't have one.
 * Skips session-pass-only members (those whose only memberships are session/daily/pass plans).
 * Returns count of IDs generated.
 */
export async function backfillMissingMemberIds() {
  const membersWithoutId = await prisma.user.findMany({
    where: {
      role: "MEMBER",
      OR: [
        { memberId: null },
        { memberId: "" },
      ],
    },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" }, // oldest first so they get lower numbers
  });

  let count = 0;
  for (const member of membersWithoutId) {
    // Skip members who only have session/daily passes
    const latestPlan = member.memberships?.[0]?.planTier?.toLowerCase() || "";
    const isSessionOnly = latestPlan && (
      latestPlan.includes("session") || 
      latestPlan.includes("daily") || 
      latestPlan.includes("pass")
    );
    if (isSessionOnly) continue;

    const newId = await generateMemberId();
    await prisma.user.update({
      where: { id: member.id },
      data: { memberId: newId },
    });
    count++;
  }

  return count;
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
