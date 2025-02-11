// // src/controllers/auth.controller.ts
// import { Request, Response } from "express";
// import { AuthService } from "../services/auth.service";
// import { RegisterDTO, LoginDTO, ChangePasswordDTO } from "../types/auth.types";
// import { ApiError } from "../middlewares/error.middleware";
// import { logger } from "../utils/logger";

// export class AuthController {
//   constructor(private authService: AuthService) {}

//   register = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const data: RegisterDTO = req.body;
//       logger.info(`Registration attempt for email: ${data.email}`);

//       const result = await this.authService.register(data);

//       logger.info(`User registered successfully: ${data.email}`);
//       res.status(201).json({
//         status: "success",
//         message: "Registration successful! Welcome to our platform.",
//         ...result,
//       });
//     } catch (error) {
//       if (error instanceof Error && "code" in error && error.code === "P2002") {
//         logger.warn(
//           `Registration failed - Email already exists: ${req.body.email}`
//         );
//         res.status(400).json({
//           status: "error",
//           message:
//             "This email is already registered. Please try logging in or use a different email.",
//         });
//         return;
//       }

//       if (error instanceof ApiError) {
//         res.status(error.statusCode).json({
//           status: "error",
//           message: error.message,
//           errors: error.errors,
//         });
//         return;
//       }

//       logger.error(
//         `Registration error: ${
//           error instanceof Error ? error.message : "Unknown error"
//         }`
//       );
//       throw error;
//     }
//   };

//   login = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const data: LoginDTO = req.body;
//       logger.info(`Login attempt for email: ${data.email}`);

//       const result = await this.authService.login(data);

//       logger.info(`User logged in successfully: ${data.email}`);
//       res.status(200).json({
//         status: "success",
//         message: "Login successful! Welcome back.",
//         ...result,
//       });
//     } catch (error) {
//       if (error instanceof Error) {
//         if (error.message === "Invalid credentials") {
//           logger.warn(`Failed login attempt for email: ${req.body.email}`);
//           res.status(401).json({
//             status: "error",
//             message: "Invalid email or password. Please try again.",
//           });
//           return;
//         }
//         if (error.message === "Account locked") {
//           logger.warn(`Login attempt on locked account: ${req.body.email}`);
//           res.status(403).json({
//             status: "error",
//             message:
//               "Your account has been locked due to multiple failed attempts. Please reset your password.",
//           });
//           return;
//         }
//       }
//       logger.error(
//         `Login error: ${
//           error instanceof Error ? error.message : "Unknown error"
//         }`
//       );
//       throw error;
//     }
//   };

//   changePassword = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const userId = req.user?.id;
//       if (!userId) {
//         throw new ApiError(401, "Authentication required");
//       }

//       const data: ChangePasswordDTO = req.body;
//       await this.authService.changePassword(userId, data);

//       logger.info(`Password changed successfully for user ID: ${userId}`);
//       res.status(200).json({
//         status: "success",
//         message:
//           "Password changed successfully. Please use your new password for future logins.",
//       });
//     } catch (error) {
//       if (error instanceof ApiError) {
//         res.status(error.statusCode).json({
//           status: "error",
//           message: error.message,
//         });
//         return;
//       }
//       logger.error(
//         `Change password error: ${
//           error instanceof Error ? error.message : "Unknown error"
//         }`
//       );
//       throw error;
//     }
//   };
// }

// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import {
  RegisterDTO,
  LoginDTO,
  ChangePasswordDTO,
  UpdateProfileDTO,
} from "../types/auth.types";
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
        message:
          "Registration successful! Please check your email to verify your account.",
        ...result,
      });
    } catch (error) {
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

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;
      await this.authService.verifyEmail({ token });

      res.status(200).json({
        status: "success",
        message: "Email verified successfully. You can now log in.",
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
      if (error instanceof ApiError) {
        // Special case for MFA required
        if (error.statusCode === 202) {
          res.status(202).json({
            status: "pending",
            message: error.message,
          });
          return;
        }

        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
        return;
      }
      throw error;
    }
  };

  verifyMfa = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "Authentication required");
      }

      const result = await this.authService.verifyMfa(userId, req.body);

      res.status(200).json({
        status: "success",
        message: "MFA verification successful.",
        ...result,
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

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "Authentication required");
      }

      const user = await this.authService.getProfile(userId);

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

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "Authentication required");
      }

      const data: UpdateProfileDTO = req.body;
      await this.authService.updateProfile(userId, data);

      res.status(200).json({
        status: "success",
        message: "Profile updated successfully.",
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

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "Authentication required");
      }

      const data: ChangePasswordDTO = req.body;
      await this.authService.changePassword(userId, data);

      res.status(200).json({
        status: "success",
        message: "Password changed successfully.",
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

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.authService.forgotPassword(req.body);

      res.status(200).json({
        status: "success",
        message:
          "If your email is registered, you will receive password reset instructions.",
      });
    } catch (error) {
      // Always return success for security (prevents email enumeration)
      res.status(200).json({
        status: "success",
        message:
          "If your email is registered, you will receive password reset instructions.",
      });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.authService.resetPassword(req.body);

      res.status(200).json({
        status: "success",
        message:
          "Password reset successful. You can now log in with your new password.",
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

  getSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "Authentication required");
      }

      const sessions = await this.authService.getSessions(userId);

      res.status(200).json({
        status: "success",
        data: sessions,
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

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const sessionId = req.body.sessionId;

      if (!userId) {
        throw new ApiError(401, "Authentication required");
      }

      await this.authService.logoutSession(userId, sessionId);

      res.status(200).json({
        status: "success",
        message: "Logged out successfully.",
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

  logoutAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "Authentication required");
      }

      await this.authService.logoutAllSessions(userId);

      res.status(200).json({
        status: "success",
        message: "Logged out from all devices successfully.",
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
