"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_service_1 = require("../services/auth.service");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_validation_1 = require("../validations/auth.validation");
const router = (0, express_1.Router)();
const authService = new auth_service_1.AuthService();
const authController = new auth_controller_1.AuthController(authService);
router.post("/register", (0, validate_middleware_1.validate)(auth_validation_1.registerSchema), async (req, res, next) => {
    try {
        await authController.register(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post("/login", (0, validate_middleware_1.validate)(auth_validation_1.loginSchema), async (req, res, next) => {
    try {
        await authController.login(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post("/change-password", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(auth_validation_1.changePasswordSchema), async (req, res, next) => {
    try {
        await authController.changePassword(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
