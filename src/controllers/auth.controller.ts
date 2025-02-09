// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { RegisterDTO, LoginDTO, ChangePasswordDTO } from "../types/auth.types";
import { ApiError } from "../middlewares/error.middleware";
import { logger } from "../utils/logger";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: RegisterDTO = req.body;
      logger.info(`Registration attempt for email: ${data.email}`);

      const result = await this.authService.register(data);

      logger.info(`User registered successfully: ${data.email}`);
      res.status(201).json({
        status: "success",
        message: "Registration successful! Welcome to our platform.",
        ...result,
      });
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "P2002") {
        logger.warn(
          `Registration failed - Email already exists: ${req.body.email}`
        );
        res.status(400).json({
          status: "error",
          message:
            "This email is already registered. Please try logging in or use a different email.",
        });
        return;
      }

      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
          errors: error.errors,
        });
        return;
      }

      logger.error(
        `Registration error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: LoginDTO = req.body;
      logger.info(`Login attempt for email: ${data.email}`);

      const result = await this.authService.login(data);

      logger.info(`User logged in successfully: ${data.email}`);
      res.status(200).json({
        status: "success",
        message: "Login successful! Welcome back.",
        ...result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid credentials") {
          logger.warn(`Failed login attempt for email: ${req.body.email}`);
          res.status(401).json({
            status: "error",
            message: "Invalid email or password. Please try again.",
          });
          return;
        }
        if (error.message === "Account locked") {
          logger.warn(`Login attempt on locked account: ${req.body.email}`);
          res.status(403).json({
            status: "error",
            message:
              "Your account has been locked due to multiple failed attempts. Please reset your password.",
          });
          return;
        }
      }
      logger.error(
        `Login error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "Authentication required");
      }

      const data: ChangePasswordDTO = req.body;
      await this.authService.changePassword(userId, data);

      logger.info(`Password changed successfully for user ID: ${userId}`);
      res.status(200).json({
        status: "success",
        message:
          "Password changed successfully. Please use your new password for future logins.",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
        return;
      }
      logger.error(
        `Change password error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  };
}
