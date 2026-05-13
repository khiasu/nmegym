import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// This lib works in the standard Node.js runtime used by Next.js
// It's the same reliable driver we used for the seed script.

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  (() => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set in environment variables");
    }

    const pool = new pg.Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Required for Neon
      },
    });

    const adapter = new PrismaPg(pool);
    
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
