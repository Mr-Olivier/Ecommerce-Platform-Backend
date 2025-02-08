// src/services/auth.service.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RegisterDTO, LoginDTO, AuthResponse } from "../types/auth.types";
import { logger } from "../utils/logger";
import { ApiError } from "../middlewares/error.middleware";

export class AuthService {
  private prisma: PrismaClient;
  private readonly SALT_ROUNDS = 10;
  private readonly MAX_LOGIN_ATTEMPTS = 5;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    // Validate password strength
    this.validatePassword(data.password);

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(), // Normalize email
        password: hashedPassword,
        name: data.name.trim(), // Trim whitespace
        role: "CUSTOMER",
        loginAttempts: 0,
        lastLogin: new Date(),
      },
    });

    // Generate token
    const token = this.generateToken(user);

    // Log successful registration
    logger.info(`New user registered: ${user.email}`);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if account is locked
    if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      throw new Error("Account locked");
    }

    // Verify password
    const validPassword = await bcrypt.compare(data.password, user.password);

    if (!validPassword) {
      // Increment login attempts
      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: { increment: 1 } },
      });

      throw new Error("Invalid credentials");
    }

    // Reset login attempts and update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lastLogin: new Date(),
      },
    });

    // Generate token
    const token = this.generateToken(user);

    // Log successful login
    logger.info(`User logged in: ${user.email}`);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
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
    if (password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters long");
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      throw new ApiError(
        400,
        "Password must contain at least one uppercase letter"
      );
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      throw new ApiError(400, "Password must contain at least one number");
    }

    // Check for at least one special character
    if (!/[!@#$%^&*]/.test(password)) {
      throw new ApiError(
        400,
        "Password must contain at least one special character (!@#$%^&*)"
      );
    }
  }
}
