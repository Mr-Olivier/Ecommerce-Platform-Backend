// // src/middlewares/validate.middleware.ts
// import { Request, Response, NextFunction } from "express";
// import { AnyZodObject } from "zod";

// export const validate =
//   (schema: AnyZodObject) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await schema.parseAsync(req.body);
//       next();
//     } catch (error) {
//       return res.status(400).json({ error });
//     }
//   };

// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError, ZodSchema } from "zod";
import { logger } from "../utils/logger";

export const validate =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      logger.warn(
        `Validation failed for ${req.method} ${req.path}`,
        error instanceof ZodError ? error.errors : error
      );

      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      return res.status(400).json({
        status: "error",
        message: "Invalid input",
        errors: [{ message: "Request validation failed" }],
      });
    }
  };
