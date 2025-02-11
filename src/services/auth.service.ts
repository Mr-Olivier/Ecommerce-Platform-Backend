// // src/services/auth.service.ts
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import {
//   RegisterDTO,
//   LoginDTO,
//   ChangePasswordDTO,
//   AuthResponse,
//   UserRole,
// } from "../types/auth.types";
// import { logger } from "../utils/logger";
// import { ApiError } from "../middlewares/error.middleware";

// export class AuthService {
//   private prisma: PrismaClient;
//   private readonly SALT_ROUNDS = 10;
//   private readonly MAX_LOGIN_ATTEMPTS = 5;
//   private readonly PASSWORD_REGEX = {
//     UPPERCASE: /[A-Z]/,
//     NUMBER: /\d/,
//     SPECIAL: /[!@#$%^&*]/,
//   };

//   constructor() {
//     this.prisma = new PrismaClient();
//   }

//   async register(data: RegisterDTO): Promise<AuthResponse> {
//     // Validate password match
//     if (data.password !== data.confirmPassword) {
//       throw new ApiError(400, "Passwords do not match");
//     }

//     // Validate password strength
//     this.validatePassword(data.password);

//     // Check if email exists
//     const existingUser = await this.prisma.user.findUnique({
//       where: { email: data.email.toLowerCase() },
//     });

//     if (existingUser) {
//       throw new ApiError(400, "Email already exists");
//     }

//     // Check if phone number exists
//     const existingPhone = await this.prisma.user.findFirst({
//       where: { phoneNumber: data.phoneNumber },
//     });

//     if (existingPhone) {
//       throw new ApiError(400, "Phone number already exists");
//     }

//     const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

//     const user = await this.prisma.user.create({
//       data: {
//         email: data.email.toLowerCase(),
//         password: hashedPassword,
//         firstName: data.firstName.trim(),
//         lastName: data.lastName.trim(),
//         phoneNumber: data.phoneNumber,
//         role: data.role,
//         loginAttempts: 0,
//         lastLogin: new Date(),
//       },
//     });

//     const token = this.generateToken(user);
//     logger.info(`New ${data.role} registered: ${user.email}`);

//     return {
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         phoneNumber: user.phoneNumber,
//         role: user.role,
//       },
//     };
//   }

//   async login(data: LoginDTO): Promise<AuthResponse> {
//     const user = await this.prisma.user.findUnique({
//       where: { email: data.email.toLowerCase() },
//     });

//     if (!user) {
//       throw new ApiError(401, "Invalid credentials");
//     }

//     if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
//       throw new ApiError(403, "Account locked due to too many failed attempts");
//     }

//     const validPassword = await bcrypt.compare(data.password, user.password);

//     if (!validPassword) {
//       await this.prisma.user.update({
//         where: { id: user.id },
//         data: { loginAttempts: { increment: 1 } },
//       });

//       const remainingAttempts =
//         this.MAX_LOGIN_ATTEMPTS - (user.loginAttempts + 1);
//       throw new ApiError(
//         401,
//         `Invalid credentials. ${remainingAttempts} attempts remaining`
//       );
//     }

//     await this.prisma.user.update({
//       where: { id: user.id },
//       data: {
//         loginAttempts: 0,
//         lastLogin: new Date(),
//       },
//     });

//     const token = this.generateToken(user);
//     logger.info(`${user.role} logged in: ${user.email}`);

//     return {
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         phoneNumber: user.phoneNumber,
//         role: user.role,
//       },
//     };
//   }

//   async changePassword(userId: string, data: ChangePasswordDTO): Promise<void> {
//     const user = await this.prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!user) {
//       throw new ApiError(404, "User not found");
//     }

//     const validCurrentPassword = await bcrypt.compare(
//       data.currentPassword,
//       user.password
//     );

//     if (!validCurrentPassword) {
//       throw new ApiError(401, "Current password is incorrect");
//     }

//     if (data.currentPassword === data.newPassword) {
//       throw new ApiError(
//         400,
//         "New password must be different from current password"
//       );
//     }

//     this.validatePassword(data.newPassword);

//     const hashedPassword = await bcrypt.hash(
//       data.newPassword,
//       this.SALT_ROUNDS
//     );

//     await this.prisma.user.update({
//       where: { id: userId },
//       data: {
//         password: hashedPassword,
//         updatedAt: new Date(),
//         loginAttempts: 0, // Reset login attempts after successful password change
//       },
//     });

//     logger.info(`Password changed successfully for user: ${user.email}`);
//   }

//   private generateToken(user: any): string {
//     return jwt.sign(
//       {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         firstName: user.firstName,
//         lastName: user.lastName,
//       },
//       process.env.JWT_SECRET!,
//       {
//         expiresIn: "24h",
//         algorithm: "HS256",
//       }
//     );
//   }

//   private validatePassword(password: string): void {
//     const errors: string[] = [];

//     if (password.length < 8) {
//       errors.push("Password must be at least 8 characters long");
//     }
//     if (!this.PASSWORD_REGEX.UPPERCASE.test(password)) {
//       errors.push("Password must contain at least one uppercase letter");
//     }
//     if (!this.PASSWORD_REGEX.NUMBER.test(password)) {
//       errors.push("Password must contain at least one number");
//     }
//     if (!this.PASSWORD_REGEX.SPECIAL.test(password)) {
//       errors.push(
//         "Password must contain at least one special character (!@#$%^&*)"
//       );
//     }

//     if (errors.length > 0) {
//       throw new ApiError(400, "Password validation failed", errors);
//     }
//   }
// }

// src/services/auth.service.ts
import { PrismaClient, UserRole, TokenType } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { EmailService } from "./email.service";
import { emailTemplates } from "../utils/email.templates";
import {
  RegisterDTO,
  LoginDTO,
  ChangePasswordDTO,
  UpdateProfileDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  VerifyEmailDTO,
  MfaDTO,
  AuthResponse,
} from "../types/auth.types";
import { logger } from "../utils/logger";
import { ApiError } from "../middlewares/error.middleware";

export class AuthService {
  private prisma: PrismaClient;
  private emailService: EmailService;
  private readonly SALT_ROUNDS = 10;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly TOKEN_EXPIRY = {
    EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
    PASSWORD_RESET: 1 * 60 * 60 * 1000, // 1 hour
    OTP: 5 * 60 * 1000, // 5 minutes
  };

  constructor() {
    this.prisma = new PrismaClient();
    this.emailService = new EmailService();
  }

  // Registration & Email Verification
  // async register(data: RegisterDTO): Promise<AuthResponse> {
  //   // Validate password match
  //   if (data.password !== data.confirmPassword) {
  //     throw new ApiError(400, "Passwords do not match");
  //   }

  //   // Validate password strength
  //   this.validatePassword(data.password);

  //   // Check existing email
  //   const existingUser = await this.prisma.user.findUnique({
  //     where: { email: data.email.toLowerCase() },
  //   });

  //   if (existingUser) {
  //     throw new ApiError(400, "Email already exists");
  //   }

  //   // Check existing phone
  //   const existingPhone = await this.prisma.user.findFirst({
  //     where: { phoneNumber: data.phoneNumber },
  //   });

  //   if (existingPhone) {
  //     throw new ApiError(400, "Phone number already exists");
  //   }

  //   // Create user
  //   const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);
  //   // const user = await this.prisma.user.create({
  //   //   data: {
  //   //     email: data.email.toLowerCase(),
  //   //     password: hashedPassword,
  //   //     firstName: data.firstName.trim(),
  //   //     lastName: data.lastName.trim(),
  //   //     phoneNumber: data.phoneNumber,
  //   //     role: data.role as UserRole,
  //   //   },
  //   // });

  //   const user = await this.prisma.user.create({
  //     data: {
  //       email: data.email.toLowerCase(),
  //       password: hashedPassword,
  //       firstName: data.firstName.trim(),
  //       lastName: data.lastName.trim(),
  //       phoneNumber: data.phoneNumber,
  //       role: data.role,
  //       // In development, optionally auto-verify email
  //       isEmailVerified:
  //         process.env.NODE_ENV === "development" &&
  //         process.env.EMAIL_VERIFICATION_REQUIRED !== "true",
  //     },
  //   });

  //   // Generate verification token
  //   const verificationToken = await this.createToken(
  //     user.id,
  //     "EMAIL_VERIFICATION"
  //   );

  //   // Send verification email
  //   await this.sendVerificationEmail(user, verificationToken.token);

  //   // Generate auth token
  //   const token = this.generateToken(user);

  //   logger.info(`New ${data.role} registered: ${user.email}`);

  //   return {
  //     token,
  //     user: {
  //       id: user.id,
  //       email: user.email,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       phoneNumber: user.phoneNumber,
  //       role: user.role,
  //       isEmailVerified: user.isEmailVerified,
  //       isMfaEnabled: user.isMfaEnabled,
  //     },
  //   };
  // }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    try {
      // Validate password match
      if (data.password !== data.confirmPassword) {
        throw new ApiError(400, "Passwords do not match");
      }

      // Validate password strength
      this.validatePassword(data.password);

      // Check existing email
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ApiError(400, "Email already exists");
      }

      // Check existing phone
      const existingPhone = await this.prisma.user.findFirst({
        where: { phoneNumber: data.phoneNumber },
      });

      if (existingPhone) {
        throw new ApiError(400, "Phone number already exists");
      }

      // Create user
      const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

      const user = await this.prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          password: hashedPassword,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phoneNumber: data.phoneNumber,
          role: data.role,
          // Auto-verify in development unless explicitly required
          isEmailVerified:
            process.env.NODE_ENV === "development" &&
            process.env.EMAIL_VERIFICATION_REQUIRED !== "true",
        },
      });

      try {
        // Only attempt email verification if required
        if (!user.isEmailVerified) {
          // Generate verification token
          const verificationToken = await this.createToken(
            user.id,
            "EMAIL_VERIFICATION"
          );

          // Send verification email
          await this.sendVerificationEmail(user, verificationToken.token);

          logger.info(`Verification email sent to: ${user.email}`);
        }
      } catch (emailError) {
        logger.error("Failed to send verification email:", emailError);
        // Don't fail registration if email fails in development
        if (process.env.NODE_ENV !== "development") {
          // In production, we might want to delete the created user
          await this.prisma.user.delete({
            where: { id: user.id },
          });
          throw new ApiError(
            500,
            "Failed to send verification email. Please try again."
          );
        }
      }

      // Generate auth token
      const token = this.generateToken(user);

      logger.info(`New ${data.role} registered: ${user.email}`, {
        userId: user.id,
        isEmailVerified: user.isEmailVerified,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isMfaEnabled: user.isMfaEnabled,
        },
      };
    } catch (error) {
      // Log the error with more details
      logger.error("Registration error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        email: data.email,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Rethrow ApiErrors as they are already formatted
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle other types of errors
      throw new ApiError(500, "Registration failed. Please try again later.");
    }
  }

  async verifyEmail(data: VerifyEmailDTO): Promise<void> {
    const token = await this.prisma.token.findFirst({
      where: {
        token: data.token,
        type: "EMAIL_VERIFICATION",
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!token) {
      throw new ApiError(400, "Invalid or expired verification token");
    }

    await this.prisma.user.update({
      where: { id: token.userId },
      data: { isEmailVerified: true },
    });

    await this.prisma.token.delete({
      where: { id: token.id },
    });

    logger.info(`Email verified for user: ${token.user.email}`);
  }

  // Login & MFA
  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isEmailVerified) {
      throw new ApiError(401, "Please verify your email before logging in");
    }

    if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      throw new ApiError(403, "Account locked due to too many failed attempts");
    }

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      await this.incrementLoginAttempts(user.id);
      throw new ApiError(401, "Invalid credentials");
    }

    // Reset login attempts and update last login
    await this.updateLoginSuccess(user.id);

    // Generate session
    const session = await this.createSession(user.id, {
      device: "Unknown",
      location: "Unknown",
      ip: "0.0.0.0",
    });

    // If MFA is enabled, send OTP
    if (user.isMfaEnabled) {
      await this.sendMfaCode(user);
      throw new ApiError(202, "MFA code sent to your email");
    }

    const token = this.generateToken(user);
    logger.info(`${user.role} logged in: ${user.email}`);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isMfaEnabled: user.isMfaEnabled,
      },
    };
  }

  async verifyMfa(userId: string, data: MfaDTO): Promise<AuthResponse> {
    const token = await this.prisma.token.findFirst({
      where: {
        userId,
        token: data.otp,
        type: "OTP",
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!token) {
      throw new ApiError(401, "Invalid or expired OTP");
    }

    await this.prisma.token.delete({
      where: { id: token.id },
    });

    const authToken = this.generateToken(token.user);
    logger.info(`MFA verified for user: ${token.user.email}`);

    return {
      token: authToken,
      user: {
        id: token.user.id,
        email: token.user.email,
        firstName: token.user.firstName,
        lastName: token.user.lastName,
        phoneNumber: token.user.phoneNumber,
        role: token.user.role,
        isEmailVerified: token.user.isEmailVerified,
        isMfaEnabled: token.user.isMfaEnabled,
      },
    };
  }

  // Profile Management
  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (data.phoneNumber) {
      const existingPhone = await this.prisma.user.findFirst({
        where: {
          phoneNumber: data.phoneNumber,
          NOT: { id: userId },
        },
      });

      if (existingPhone) {
        throw new ApiError(400, "Phone number already exists");
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    logger.info(`Profile updated for user: ${user.email}`);
  }

  // Password Management
  async changePassword(userId: string, data: ChangePasswordDTO): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const validCurrentPassword = await bcrypt.compare(
      data.currentPassword,
      user.password
    );

    if (!validCurrentPassword) {
      throw new ApiError(401, "Current password is incorrect");
    }

    if (data.currentPassword === data.newPassword) {
      throw new ApiError(
        400,
        "New password must be different from current password"
      );
    }

    this.validatePassword(data.newPassword);
    const hashedPassword = await bcrypt.hash(
      data.newPassword,
      this.SALT_ROUNDS
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        loginAttempts: 0,
      },
    });

    logger.info(`Password changed for user: ${user.email}`);
  }

  async forgotPassword(data: ForgotPasswordDTO): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      // Return success even if email doesn't exist (security)
      return;
    }

    const token = await this.createToken(user.id, "PASSWORD_RESET");
    await this.sendPasswordResetEmail(user, token.token);

    logger.info(`Password reset requested for: ${user.email}`);
  }

  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    const token = await this.prisma.token.findFirst({
      where: {
        token: data.token,
        type: "PASSWORD_RESET",
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!token) {
      throw new ApiError(400, "Invalid or expired reset token");
    }

    if (data.newPassword !== data.confirmPassword) {
      throw new ApiError(400, "Passwords do not match");
    }

    this.validatePassword(data.newPassword);
    const hashedPassword = await bcrypt.hash(
      data.newPassword,
      this.SALT_ROUNDS
    );

    await this.prisma.user.update({
      where: { id: token.userId },
      data: {
        password: hashedPassword,
        loginAttempts: 0,
      },
    });

    await this.prisma.token.delete({
      where: { id: token.id },
    });

    logger.info(`Password reset completed for: ${token.user.email}`);
  }

  // Session Management
  async getSessions(userId: string) {
    return await this.prisma.session.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: { lastUsed: "desc" },
    });
  }

  async logoutSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    logger.info(`Session logged out for user ID: ${userId}`);
  }

  async logoutAllSessions(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: { isActive: false },
    });

    logger.info(`All sessions logged out for user ID: ${userId}`);
  }

  // Helper Methods
  private async createToken(userId: string, type: TokenType): Promise<any> {
    const token = crypto.randomBytes(32).toString("hex");
    return await this.prisma.token.create({
      data: {
        userId,
        token,
        type,
        expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY[type]),
      },
    });
  }

  private async createSession(userId: string, data: any): Promise<any> {
    return await this.prisma.session.create({
      data: {
        userId,
        device: data.device,
        location: data.location,
        ip: data.ip,
      },
    });
  }

  private async sendVerificationEmail(user: any, token: string): Promise<void> {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await this.emailService.sendEmail({
      to: user.email,
      ...emailTemplates.verifyEmail({
        name: user.firstName,
        link: verificationLink,
      }),
    });
  }

  private async sendPasswordResetEmail(
    user: any,
    token: string
  ): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.emailService.sendEmail({
      to: user.email,
      ...emailTemplates.resetPassword({
        name: user.firstName,
        link: resetLink,
      }),
    });
  }

  private async sendMfaCode(user: any): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.createToken(user.id, "OTP");

    await this.emailService.sendEmail({
      to: user.email,
      ...emailTemplates.mfaCode({
        name: user.firstName,
        otp,
      }),
    });
  }

  private generateToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "24h",
        algorithm: "HS256",
      }
    );
  }

  private validatePassword(password: string): void {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push(
        "Password must contain at least one special character (!@#$%^&*)"
      );
    }
    if (errors.length > 0) {
      throw new ApiError(400, "Password validation failed", errors);
    }
  }

  private async incrementLoginAttempts(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        loginAttempts: { increment: 1 },
      },
    });
  }

  private async updateLoginSuccess(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        loginAttempts: 0,
        lastLogin: new Date(),
      },
    });
  }

  // Add these methods to your existing AuthService class

  // Admin Methods
  async getAllUsers(filters: any) {
    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: "insensitive" } },
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        isEmailVerified: true,
        isMfaEnabled: true,
      },
    });

    return users;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        isEmailVerified: true,
        isMfaEnabled: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  async changeUserRole(userId: string, role: UserRole, adminId: string) {
    // Check if user exists
    const user = await this.getUserById(userId);

    // Prevent admin from changing their own role
    if (userId === adminId) {
      throw new ApiError(400, "Cannot change your own role");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Log the activity
    await this.prisma.userActivity.create({
      data: {
        userId,
        type: "ROLE_CHANGE",
        details: `Role changed to ${role} by admin ${adminId}`,
      },
    });

    logger.info(
      `User role changed to ${role} for user ID: ${userId} by admin ID: ${adminId}`
    );
  }

  async deactivateUser(userId: string, adminId: string) {
    // Check if user exists
    const user = await this.getUserById(userId);

    // Prevent admin from deactivating themselves
    if (userId === adminId) {
      throw new ApiError(400, "Cannot deactivate your own account");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Log the activity
    await this.prisma.userActivity.create({
      data: {
        userId,
        type: "ACCOUNT_DEACTIVATED",
        details: `Account deactivated by admin ${adminId}`,
      },
    });

    logger.info(`User deactivated: ${userId} by admin ID: ${adminId}`);
  }

  async reactivateUser(userId: string, adminId: string) {
    // Check if user exists
    const user = await this.getUserById(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    // Log the activity
    await this.prisma.userActivity.create({
      data: {
        userId,
        type: "ACCOUNT_REACTIVATED",
        details: `Account reactivated by admin ${adminId}`,
      },
    });

    logger.info(`User reactivated: ${userId} by admin ID: ${adminId}`);
  }

  async getUserActivity(userId: string) {
    // Verify user exists
    await this.getUserById(userId);

    const activities = await this.prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        details: true,
        createdAt: true,
      },
    });

    return activities;
  }

  async getProfile(userId: string) {
    return await this.getUserById(userId);
  }
}
