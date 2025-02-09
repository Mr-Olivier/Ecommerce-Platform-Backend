"use strict";
// // src/middlewares/validate.middleware.ts
// import { Request, Response, NextFunction } from "express";
// import { AnyZodObject } from "zod";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync(req.body);
        next();
    }
    catch (error) {
        logger_1.logger.warn(`Validation failed for ${req.method} ${req.path}`, error instanceof zod_1.ZodError ? error.errors : error);
        if (error instanceof zod_1.ZodError) {
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
exports.validate = validate;
