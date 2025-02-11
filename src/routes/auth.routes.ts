// // src/routes/auth.routes.ts
// import { Router, Request, Response, NextFunction } from "express";
// import { AuthController } from "../controllers/auth.controller";
// import { AuthService } from "../services/auth.service";
// import { validate } from "../middlewares/validate.middleware";
// import { authenticate } from "../middlewares/auth.middleware";
// import {
//   registerSchema,
//   loginSchema,
//   changePasswordSchema,
// } from "../validations/auth.validation";

// const router = Router();
// const authService = new AuthService();
// const authController = new AuthController(authService);

// router.post(
//   "/register",
//   validate(registerSchema) as any,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await authController.register(req, res);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/login",
//   validate(loginSchema) as any,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await authController.login(req, res);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/change-password",
//   authenticate,
//   validate(changePasswordSchema) as any,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await authController.changePassword(req, res);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// export default router;

// src/routes/auth.routes.ts
import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  mfaVerificationSchema,
  emailVerificationSchema,
} from "../validations/auth.validation";

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

// Registration and Email Verification
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

router.get(
  "/verify-email/:token",
  validate(emailVerificationSchema) as any,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.verifyEmail(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Authentication
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

router.post(
  "/verify-mfa",
  authenticate,
  validate(mfaVerificationSchema) as any,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.verifyMfa(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Profile Management
router.get(
  "/profile",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.getProfile(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/update-profile",
  authenticate,
  validate(updateProfileSchema) as any,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.updateProfile(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Password Management
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema) as any,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.changePassword(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema) as any,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.forgotPassword(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema) as any,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.resetPassword(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Session Management
router.get(
  "/sessions",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.getSessions(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/logout",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.logout(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/logout-all",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.logoutAll(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
