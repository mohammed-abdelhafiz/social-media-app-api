import { Request, Response } from "express";
import notificationService from "./notification.service";

export const getNotifications = async (req: Request, res: Response) => {
  const userId = req.JwtPayload?.userId.toString();
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  
  const notifications = await notificationService.getUserNotifications(userId);
  res.status(200).json({
    status: "success",
    data: notifications,
  });
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const userId = req.JwtPayload?.userId.toString();
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const count = await notificationService.getUnreadCount(userId);
  res.status(200).json({
    status: "success",
    data: { count },
  });
};

export const markAsRead = async (req: Request, res: Response) => {
  const userId = req.JwtPayload?.userId.toString();
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  
  const { id } = req.params;
  const notification = await notificationService.markAsRead(
    id as string,
    userId
  );
  res.status(200).json({
    status: "success",
    data: notification,
  });
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const userId = req.JwtPayload?.userId.toString();
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  await notificationService.markAllAsRead(userId);
  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  });
};

export const deleteNotification = async (req: Request, res: Response) => {
  const userId = req.JwtPayload?.userId.toString();
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  await notificationService.deleteNotification(id as string, userId);
  res.status(204).json({
    status: "success",
    data: null,
  });
};
