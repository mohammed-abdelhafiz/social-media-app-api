import { Router } from "express";
import authController from "../controllers/auth.controller";
import authenticate from "../middlewares/authenticate";

const router = Router();

// auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-access-token", authController.refreshAccessToken);
router.post("/logout", authenticate, authController.logout);

export default router;
