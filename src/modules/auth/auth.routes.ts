import { Router } from "express";
import * as authController from "./auth.controller";
import {authenticate} from "@/shared/middlewares/auth.middleware";

const router = Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/logout", authenticate, authController.logout);

router.post("/refresh", authController.refreshAccessToken);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password/:token", authController.resetPassword);

router.get("/me", authenticate, authController.getMe);

export default router;
