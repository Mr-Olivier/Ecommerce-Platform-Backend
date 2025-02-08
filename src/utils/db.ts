// Create src/utils/db.ts for database connection management
import { prisma } from "./prisma";
import { logger } from "./logger";

export async function connectDB() {
  try {
    await prisma.$connect();
    logger.info("Connected to database successfully");
  } catch (error) {
    logger.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await prisma.$disconnect();
    logger.info("Disconnected from database successfully");
  } catch (error) {
    logger.error("Failed to disconnect from database:", error);
    process.exit(1);
  }
}
