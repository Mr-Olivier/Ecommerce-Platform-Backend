// src/services/auth.service.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  RegisterDTO,
  LoginDTO,
  ChangePasswordDTO,
  AuthResponse,
  UserRole,
} from "../types/auth.types";
import { logger } from "../utils/logger";
import { ApiError } from "../middlewares/error.middleware";

export class AuthService {
  private prisma: PrismaClient;
  private readonly SALT_ROUNDS = 10;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly PASSWORD_REGEX = {
    UPPERCASE: /[A-Z]/,
    NUMBER: /\d/,
    SPECIAL: /[!@#$%^&*]/,
  };

  constructor() {
    this.prisma = new PrismaClient();
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    // Validate password match
    if (data.password !== data.confirmPassword) {
      throw new ApiError(400, "Passwords do not match");
    }

    // Validate password strength
    this.validatePassword(data.password);

    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ApiError(400, "Email already exists");
    }

    // Check if phone number exists
    const existingPhone = await this.prisma.user.findFirst({
      where: { phoneNumber: data.phoneNumber },
    });

    if (existingPhone) {
      throw new ApiError(400, "Phone number already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phoneNumber: data.phoneNumber,
        role: data.role,
        loginAttempts: 0,
        lastLogin: new Date(),
      },
    });

    const token = this.generateToken(user);
    logger.info(`New ${data.role} registered: ${user.email}`);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      throw new ApiError(403, "Account locked due to too many failed attempts");
    }

    const validPassword = await bcrypt.compare(data.password, user.password);

    if (!validPassword) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: { increment: 1 } },
      });

      const remainingAttempts =
        this.MAX_LOGIN_ATTEMPTS - (user.loginAttempts + 1);
      throw new ApiError(
        401,
        `Invalid credentials. ${remainingAttempts} attempts remaining`
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lastLogin: new Date(),
      },
    });

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
      },
    };
  }

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
        updatedAt: new Date(),
        loginAttempts: 0, // Reset login attempts after successful password change
      },
    });

    logger.info(`Password changed successfully for user: ${user.email}`);
  }

  private generateToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "24h",
        algorithm: "HS256",
      }
    );
  }

  private validatePassword(password: string): void {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!this.PASSWORD_REGEX.UPPERCASE.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!this.PASSWORD_REGEX.NUMBER.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!this.PASSWORD_REGEX.SPECIAL.test(password)) {
      errors.push(
        "Password must contain at least one special character (!@#$%^&*)"
      );
    }

    if (errors.length > 0) {
      throw new ApiError(400, "Password validation failed", errors);
    }
  }
}
