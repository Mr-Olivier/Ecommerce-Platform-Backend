"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const error_middleware_1 = require("./middlewares/error.middleware");
const notFound_middleware_1 = require("./middlewares/notFound.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const swagger_1 = require("./docs/swagger");
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
    maxAge: 3600,
};
// Middlewares
app.use((0, cors_1.default)(corsOptions));
// JSON parser with validation
app.use(express_1.default.json({
    limit: "10mb",
    verify: (req, _, buf) => {
        if (buf.length) {
            try {
                JSON.parse(buf.toString());
            }
            catch (e) {
                req.invalidJson = true;
                req.jsonError = e;
            }
        }
    },
}));
// JSON Error Check Middleware
const jsonErrorHandler = (req, res, next) => {
    var _a;
    const extReq = req;
    if (extReq.invalidJson) {
        logger_1.logger.error("Invalid JSON payload received:", extReq.jsonError);
        res.status(400).json({
            status: "error",
            message: "Invalid JSON payload",
            details: ((_a = extReq.jsonError) === null || _a === void 0 ? void 0 : _a.message) || "JSON parsing error",
        });
        return;
    }
    next();
};
app.use(jsonErrorHandler);
// Request logging in development
if (process.env.NODE_ENV !== "production") {
    app.use((0, morgan_1.default)("dev"));
}
// Basic security headers
const securityHeaders = (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
};
app.use(securityHeaders);
// Request timestamp
const timestampMiddleware = (req, res, next) => {
    req.timestamp = new Date();
    next();
};
app.use(timestampMiddleware);
// Setup Swagger documentation
(0, swagger_1.setupSwagger)(app);
// Health check endpoint
const healthCheck = (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
    });
};
app.get("/health", healthCheck);
// API routes
app.use("/api/auth", auth_routes_1.default);
// Error handling
app.use(error_middleware_1.errorHandler);
// 404 handler
app.use(notFound_middleware_1.notFoundHandler);
// Fallback error handler
const fallbackErrorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    logger_1.logger.error("Unhandled error:", err);
    res.status(500).json(Object.assign({ status: "error", message: "Something went wrong!" }, (process.env.NODE_ENV === "development" && {
        details: err.message,
        stack: err.stack,
    })));
};
app.use(fallbackErrorHandler);
exports.default = app;
