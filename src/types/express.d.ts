// src/types/express.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
      timestamp?: Date;
      invalidJson?: boolean;
      jsonError?: Error;
    }
  }
}

// Ensure this file is treated as a module
export {};
