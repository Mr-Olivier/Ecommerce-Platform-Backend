"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApiError = void 0;
const logger_1 = require("../utils/logger");
class ApiError extends Error {
    constructor(statusCode, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.ApiError = ApiError;
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(`Error processing ${req.method} ${req.path}:`, err);
    // Check if headers have already been sent
    if (res.headersSent) {
        return next(err);
    }
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            status: "error",
            message: err.message,
            errors: err.errors,
        });
        return;
    }
    // Handle Prisma errors
    if ("code" in err && typeof err.code === "string") {
        switch (err.code) {
            case "P2002":
                res.status(400).json({
                    status: "error",
                    message: "A record with this value already exists",
                });
                break;
            default:
                res.status(500).json({
                    status: "error",
                    message: "Database operation failed",
                });
        }
        return;
    }
    // Default error response
    res.status(500).json(Object.assign({ status: "error", message: "Internal server error" }, (process.env.NODE_ENV === "development" && {
        details: err.message,
        stack: err.stack,
    })));
};
exports.errorHandler = errorHandler;
