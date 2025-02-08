// src/utils/prisma.ts
import { PrismaClient } from "@prisma/client";

// Create a singleton instance of PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
