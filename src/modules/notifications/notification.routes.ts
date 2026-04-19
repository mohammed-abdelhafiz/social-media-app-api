import { Router } from "express";
import * as notificationController from "./notification.controller";
import { authenticate } from "@/shared/middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/mark-all-read", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

export default router;
