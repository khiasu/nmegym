// Prisma 7 configuration for Neon PostgreSQL
// Connection URLs are configured here, NOT in schema.prisma
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node prisma/seed.js",
    adapter: async () => {
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      const { neon } = await import("@neondatabase/serverless");
      const connectionString = process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"];
      const sql = neon(connectionString);
      return new PrismaNeon(sql);
    },
  },
  datasource: {
    // Pooled connection URL for Prisma Client queries
    url: process.env["DATABASE_URL"],
    // Direct connection URL for migrations/schema push
    directUrl: process.env["DIRECT_URL"],
  },
});
