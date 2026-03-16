import { Router } from "express";
import authController from "../controllers/auth.controller";
import authenticate from "../middlewares/authenticate";

const router = Router();

router.get("/me", authenticate, authController.getMe);

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/logout", authenticate, authController.logout);

router.post("/refresh-access-token", authController.refreshAccessToken);

router.post("/request-reset-password", authController.requestResetPassword);

router.post("/reset-password/:token", authController.resetPassword);

export default router;
