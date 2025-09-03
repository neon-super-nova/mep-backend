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
}

export const notificationResource = new NotificationResource();
