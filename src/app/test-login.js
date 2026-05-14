// src/app/test-login.js
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  const email = 'admin@nmegym.in';
  const pass = 'nme2025';

  try {
    console.log("Checking user...");
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log("❌ User not found in DB");
      return;
    }

    console.log(`User Found: ${user.email}`);
    console.log(`Role: ${user.role}`);
    
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    console.log(`Password Match: ${isMatch}`);
  } catch (err) {
    console.error("Error during test:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
