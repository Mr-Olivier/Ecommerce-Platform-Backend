// src/routes/auth.routes.ts
import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validations/auth.validation";

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post(
  "/register",
  validate(registerSchema) as any,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.register(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  validate(loginSchema) as any,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.login(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
