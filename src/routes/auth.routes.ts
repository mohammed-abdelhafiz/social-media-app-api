import { Router } from "express";
import authController from "../controllers/auth.controller";
import authenticate from "../middlewares/authenticate";

const router = Router();

// =======================
// AUTH ROUTES
// =======================

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post("/login", authController.login);

/**
 * @route POST /api/auth/refresh-access-token
 * @desc Refresh access token
 * @access Public
 */
router.post("/refresh-access-token", authController.refreshAccessToken);

/**
 * @route POST /api/auth/logout
 * @desc Logout a user
 * @access Private (requires authentication)
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route POST /api/auth/request-reset-password
 * @desc Request reset password
 * @access Public
 */
router.post("/request-reset-password", authController.requestResetPassword);

/**
 * `@route` POST /api/auth/reset-password/:token
 * `@desc` Reset password
 * `@access` Public
 */
router.post("/reset-password/:token", authController.resetPassword);

export default router;
