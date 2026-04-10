import Notification, { NotificationType } from "./Notification.model";
import mongoose from "mongoose";

class NotificationService {
  async createNotification({
    recipient,
    sender,
    type,
    post,
    comment,
  }: {
    recipient: string | mongoose.Types.ObjectId;
    sender: string | mongoose.Types.ObjectId;
    type: NotificationType;
    post?: string | mongoose.Types.ObjectId;
    comment?: string | mongoose.Types.ObjectId;
  }) {
    // Don't notify if the recipient is the sender
    if (recipient.toString() === sender.toString()) return;

    // Check if a similar notification already exists to avoid spamming (optional logic)
    // For likes, we might want to only show the most recent or group them, 
    // but for now, let's just create them.

    return await Notification.create({
      recipient,
      sender,
      type,
      post,
      comment,
    });
  }

  async getUserNotifications(userId: string) {
    return await Notification.find({ recipient: userId })
      .populate("sender", "username profileImage")
      .populate("post", "content")
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async markAsRead(notificationId: string, userId: string) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string) {
    return await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(userId: string) {
    return await Notification.countDocuments({ recipient: userId, isRead: false });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });
  }
}

export default new NotificationService();
