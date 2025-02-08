// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { logger } from "../utils/logger";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: any[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`Error processing ${req.method} ${req.path}:`, err);

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
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      details: err.message,
      stack: err.stack,
    }),
  });
};
