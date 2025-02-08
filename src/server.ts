// src/server.ts
import app from "./app";
import { logger } from "./utils/logger";
import { connectDB } from "./utils/db";
import { prisma } from "./utils/prisma";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Display startup banner
const displayBanner = () => {
  console.clear();
  console.log("=======================================");
  console.log("           E-Commerce API             ");
  console.log("=======================================");
  console.log("\n");
};

const displayServerInfo = () => {
  console.log("\n🚀 Server Status:");
  console.log("------------------");
  console.log(`🌎 Environment: ${NODE_ENV}`);
  console.log(`🏃 Port: ${PORT}`);
  console.log(`📚 Docs: http://localhost:${PORT}/docs`);

  if (NODE_ENV === "development") {
    console.log("\n🛠️  Development Tools:");
    console.log("------------------");
    console.log("📝 Swagger UI: Enabled");
    console.log("🔄 Auto-reload: Active");
    console.log("🎯 Prisma Studio: Available (npm run prisma:studio)");
  }

  console.log("\n💻 API Endpoints:");
  console.log("------------------");
  console.log(`🔑 Auth: http://localhost:${PORT}/api/auth`);
  console.log("\n=======================================\n");
};

async function startServer() {
  try {
    // Display banner
    displayBanner();

    // Connect to database
    logger.info("📡 Connecting to database...");
    await connectDB();
    logger.info("✅ Database connected successfully");

    // Start server
    app.listen(PORT, () => {
      displayServerInfo();
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Process handling
const handleProcessEvents = () => {
  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    logger.error("❌ Uncaught Exception:", error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

// Graceful shutdown function
async function gracefulShutdown(signal: string) {
  logger.info(`\n📥 Received ${signal}. Starting graceful shutdown...`);

  try {
    // Disconnect from database
    logger.info("📤 Closing database connection...");
    await prisma.$disconnect();
    logger.info("✅ Database disconnected successfully");

    logger.info("👋 Server shutdown complete");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
}

// Initialize process handlers and start server
handleProcessEvents();
startServer();
