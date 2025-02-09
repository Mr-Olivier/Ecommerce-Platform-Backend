"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./utils/logger");
const db_1 = require("./utils/db");
const prisma_1 = require("./utils/prisma");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
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
        logger_1.logger.info("📡 Connecting to database...");
        await (0, db_1.connectDB)();
        logger_1.logger.info("✅ Database connected successfully");
        // Start server
        app_1.default.listen(PORT, () => {
            displayServerInfo();
        });
    }
    catch (error) {
        logger_1.logger.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}
// Process handling
const handleProcessEvents = () => {
    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
        logger_1.logger.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    });
    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
        logger_1.logger.error("❌ Uncaught Exception:", error);
        process.exit(1);
    });
    // Graceful shutdown
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};
// Graceful shutdown function
async function gracefulShutdown(signal) {
    logger_1.logger.info(`\n📥 Received ${signal}. Starting graceful shutdown...`);
    try {
        // Disconnect from database
        logger_1.logger.info("📤 Closing database connection...");
        await prisma_1.prisma.$disconnect();
        logger_1.logger.info("✅ Database disconnected successfully");
        logger_1.logger.info("👋 Server shutdown complete");
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error("❌ Error during shutdown:", error);
        process.exit(1);
    }
}
// Initialize process handlers and start server
handleProcessEvents();
startServer();
