import express from "express";
import { notificationService } from "../../service/notifications/notificationService.js";
import { authenticateToken } from "../../middleware/authentication.js";

class NotificationResource {
  constructor() {
    this.router = express.Router();
    this.notificationService = notificationService;
    this.initRoutes();
  }

  initRoutes() {
    this.router.get("/", authenticateToken, this.getNotifications.bind(this));
    this.router.post(
      "/:notificationId",
      authenticateToken,
      this.markNotificationAsRead.bind(this)
    );
  }

  async getNotifications(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const notifications = await this.notificationService.getNotifications(
        userId
      );
      // console.log("notifications fetched are " + notifications);
      return res.status(200).json({ notifications: notifications });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async markNotificationAsRead(req, res) {
    try {
      const userId = req.user?.userId;
      const notificationId = req.params.notificationId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const update = await this.notificationService.markNotificationAsRead(
        notificationId
      );
      if (!update.success) {
        return res.status(400).json({ error: update?.error || "error" });
      }
      return res.status(200).json({ message: "Notification marked as read" });
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }
}

export const notificationResource = new NotificationResource();
