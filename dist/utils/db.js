"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
// Create src/utils/db.ts for database connection management
const prisma_1 = require("./prisma");
const logger_1 = require("./logger");
async function connectDB() {
    try {
        await prisma_1.prisma.$connect();
        logger_1.logger.info("Connected to database successfully");
    }
    catch (error) {
        logger_1.logger.error("Failed to connect to database:", error);
        process.exit(1);
    }
}
async function disconnectDB() {
    try {
        await prisma_1.prisma.$disconnect();
        logger_1.logger.info("Disconnected from database successfully");
    }
    catch (error) {
        logger_1.logger.error("Failed to disconnect from database:", error);
        process.exit(1);
    }
}
