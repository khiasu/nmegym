// src/auth.js — NextAuth v5 (beta) configuration
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const loginInput = credentials.email.trim();
          console.log(`[AUTH] Attempting login for input: ${loginInput}`);
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: loginInput.toLowerCase() },
                { memberId: loginInput.toUpperCase() },
                { memberId: loginInput }
              ]
            }
          });
 
          if (!user || !user.passwordHash) {
            console.warn(`[AUTH] User not found or no password set for: ${credentials.email}`);
            return null;
          }
 
          console.log(`[AUTH] User found: ${user.email}. Checking password...`);
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );
 
          if (!isPasswordCorrect) {
            console.warn(`[AUTH] Password mismatch for: ${credentials.email}`);
            return null;
          }
 
          console.log(`[AUTH] Login successful for: ${user.email} (${user.role})`);
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            role: user.role,
          };
        } catch (error) {
          console.error("[AUTH] Database or bcrypt error during authorize:", error);
          return null;
        }
      },
    }),
  ],
});
