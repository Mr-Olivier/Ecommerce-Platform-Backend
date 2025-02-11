// src/middlewares/authorize.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ApiError } from "./error.middleware";
import { logger } from "../utils/logger";

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    if (user.role !== "ADMIN") {
      logger.warn(`Unauthorized admin access attempt by user: ${user.id}`);
      throw new ApiError(403, "Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeOwnerOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = req.user;
    const requestedUserId = req.params.userId;

    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    if (user.role !== "ADMIN" && user.id !== requestedUserId) {
      logger.warn(`Unauthorized access attempt by user: ${user.id}`);
      throw new ApiError(403, "Unauthorized access");
    }

    next();
  } catch (error) {
    next(error);
  }
};
