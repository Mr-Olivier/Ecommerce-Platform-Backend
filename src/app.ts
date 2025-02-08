// src/app.ts
import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import authRoutes from "./routes/auth.routes";
import { setupSwagger } from "./docs/swagger";
import { logger } from "./utils/logger";

const app = express();

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
app.use(cors(corsOptions));

// JSON parser with validation
app.use(
  express.json({
    limit: "10mb",
    verify: (req: any, _: Response, buf: Buffer) => {
      if (buf.length) {
        try {
          JSON.parse(buf.toString());
        } catch (e) {
          req.invalidJson = true;
          req.jsonError = e;
        }
      }
    },
  })
);

// JSON Error Check Middleware
const jsonErrorHandler: RequestHandler = (req, res, next) => {
  const extReq = req as Express.Request;
  if (extReq.invalidJson) {
    logger.error("Invalid JSON payload received:", extReq.jsonError);
    res.status(400).json({
      status: "error",
      message: "Invalid JSON payload",
      details: extReq.jsonError?.message || "JSON parsing error",
    });
    return;
  }
  next();
};

app.use(jsonErrorHandler);

// Request logging in development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Basic security headers
const securityHeaders: RequestHandler = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
};

app.use(securityHeaders);

// Request timestamp
const timestampMiddleware: RequestHandler = (req, res, next) => {
  req.timestamp = new Date();
  next();
};

app.use(timestampMiddleware);

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
const healthCheck: RequestHandler = (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
};

app.get("/health", healthCheck);

// API routes
app.use("/api/auth", authRoutes);

// Error handling
app.use(errorHandler as express.ErrorRequestHandler);

// 404 handler
app.use(notFoundHandler);

// Fallback error handler
const fallbackErrorHandler: express.ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && {
      details: err.message,
      stack: err.stack,
    }),
  });
};

app.use(fallbackErrorHandler);

export default app;
