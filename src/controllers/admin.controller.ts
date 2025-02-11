// src/controllers/admin.controller.ts
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { ApiError } from "../middlewares/error.middleware";
import { logger } from "../utils/logger";

export class AdminController {
  constructor(private authService: AuthService) {}

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = req.query;
      const users = await this.authService.getAllUsers(filters);

      res.status(200).json({
        status: "success",
        data: users,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
        return;
      }
      throw error;
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const user = await this.authService.getUserById(userId);

      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
        return;
      }
      throw error;
    }
  };

  changeUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        throw new ApiError(401, "Admin authentication required");
      }

      await this.authService.changeUserRole(userId, role, adminId);

      logger.info(`User role changed by admin ${adminId} for user ${userId}`);
      res.status(200).json({
        status: "success",
        message: "User role updated successfully",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
        return;
      }
      throw error;
    }
  };

  deactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        throw new ApiError(401, "Admin authentication required");
      }

      await this.authService.deactivateUser(userId, adminId);

      logger.info(`User deactivated by admin ${adminId} for user ${userId}`);
      res.status(200).json({
        status: "success",
        message: "User account deactivated successfully",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
        return;
      }
      throw error;
    }
  };

  reactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        throw new ApiError(401, "Admin authentication required");
      }

      await this.authService.reactivateUser(userId, adminId);

      logger.info(`User reactivated by admin ${adminId} for user ${userId}`);
      res.status(200).json({
        status: "success",
        message: "User account reactivated successfully",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
        return;
      }
      throw error;
    }
  };

  getUserActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const activity = await this.authService.getUserActivity(userId);

      res.status(200).json({
        status: "success",
        data: activity,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
        return;
      }
      throw error;
    }
  };
}
