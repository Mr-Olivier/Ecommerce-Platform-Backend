"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const logger_1 = require("../utils/logger");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.register = async (req, res) => {
            try {
                const data = req.body;
                logger_1.logger.info(`Registration attempt for email: ${data.email}`);
                const result = await this.authService.register(data);
                logger_1.logger.info(`User registered successfully: ${data.email}`);
                res.status(201).json(Object.assign({ status: "success", message: "Registration successful! Welcome to our platform." }, result));
            }
            catch (error) {
                if (error instanceof Error && "code" in error && error.code === "P2002") {
                    logger_1.logger.warn(`Registration failed - Email already exists: ${req.body.email}`);
                    res.status(400).json({
                        status: "error",
                        message: "This email is already registered. Please try logging in or use a different email.",
                    });
                    return;
                }
                if (error instanceof error_middleware_1.ApiError) {
                    res.status(error.statusCode).json({
                        status: "error",
                        message: error.message,
                        errors: error.errors,
                    });
                    return;
                }
                logger_1.logger.error(`Registration error: ${error instanceof Error ? error.message : "Unknown error"}`);
                throw error;
            }
        };
        this.login = async (req, res) => {
            try {
                const data = req.body;
                logger_1.logger.info(`Login attempt for email: ${data.email}`);
                const result = await this.authService.login(data);
                logger_1.logger.info(`User logged in successfully: ${data.email}`);
                res.status(200).json(Object.assign({ status: "success", message: "Login successful! Welcome back." }, result));
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.message === "Invalid credentials") {
                        logger_1.logger.warn(`Failed login attempt for email: ${req.body.email}`);
                        res.status(401).json({
                            status: "error",
                            message: "Invalid email or password. Please try again.",
                        });
                        return;
                    }
                    if (error.message === "Account locked") {
                        logger_1.logger.warn(`Login attempt on locked account: ${req.body.email}`);
                        res.status(403).json({
                            status: "error",
                            message: "Your account has been locked due to multiple failed attempts. Please reset your password.",
                        });
                        return;
                    }
                }
                logger_1.logger.error(`Login error: ${error instanceof Error ? error.message : "Unknown error"}`);
                throw error;
            }
        };
        this.changePassword = async (req, res) => {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new error_middleware_1.ApiError(401, "Authentication required");
                }
                const data = req.body;
                await this.authService.changePassword(userId, data);
                logger_1.logger.info(`Password changed successfully for user ID: ${userId}`);
                res.status(200).json({
                    status: "success",
                    message: "Password changed successfully. Please use your new password for future logins.",
                });
            }
            catch (error) {
                if (error instanceof error_middleware_1.ApiError) {
                    res.status(error.statusCode).json({
                        status: "error",
                        message: error.message,
                    });
                    return;
                }
                logger_1.logger.error(`Change password error: ${error instanceof Error ? error.message : "Unknown error"}`);
                throw error;
            }
        };
    }
}
exports.AuthController = AuthController;
