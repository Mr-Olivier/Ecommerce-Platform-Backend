// src/routes/admin.routes.ts
import { Router, Request, Response, NextFunction } from "express";
import { AdminController } from "../controllers/admin.controller";
import { AuthService } from "../services/auth.service";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeAdmin } from "../middlewares/authorize.middleware";
import {
  changeRoleSchema,
  userFilterSchema,
} from "../validations/admin.validation";

const router = Router();
const authService = new AuthService();
const adminController = new AdminController(authService);

// Get all users with filters
router.get(
  "/users",
  authenticate,
  authorizeAdmin,
  validate(userFilterSchema) as any,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await adminController.getUsers(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Get single user details
router.get(
  "/users/:userId",
  authenticate,
  authorizeAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await adminController.getUserById(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Change user role
router.put(
  "/users/:userId/change-role",
  authenticate,
  authorizeAdmin,
  validate(changeRoleSchema) as any,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await adminController.changeUserRole(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Deactivate user account
router.put(
  "/users/:userId/deactivate",
  authenticate,
  authorizeAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await adminController.deactivateUser(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Reactivate user account
router.put(
  "/users/:userId/reactivate",
  authenticate,
  authorizeAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await adminController.reactivateUser(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Get user activity logs
router.get(
  "/users/:userId/activity",
  authenticate,
  authorizeAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await adminController.getUserActivity(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
