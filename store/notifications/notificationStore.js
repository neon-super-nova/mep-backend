import { ObjectId } from "mongodb";
import { getDatabase } from "../database.js";
import { notificationCollection } from "./notificationSchema.js";

class NotificationStore {
  constructor() {
    this.collection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection(notificationCollection);
    this.recipeCollection = db.collection("recipes");
    this.userCollection = db.collection("users");
    this.likesCollection = db.collection("likes");
    this.reviewsCollection = db.collection("reviews");
    this.userLoginsCollection = db.collection("user-logins");
  }

  async createNotification(type, senderId, recipientId, recipeId) {
    const newNotification = {
      type,
      senderId,
      recipientId,
      recipeId,
      createdAt: new Date(),
      read: false,
    };
    await this.collection.insertOne(newNotification);
  }

  async getNotifications(recipientId, lastLoginDate, limit = 5) {
    const notifications = await this.collection
      .aggregate([
        {
          $match: {
            recipientId,
            // createdAt: { $gte: lastLoginDate },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            type: 1,
            senderId: 1,
            recipeId: 1,
            createdAt: 1,
          },
        },
      ])
      .toArray();

    // need to return senderId picture, senderId username, recipe name, recipe.imageUrls[0]?
    if (notifications.length === 0) {
      return [];
    }

    const senderIds = notifications.map(
      (notification) => new ObjectId(notification.senderId)
    );

    const senderInfo = await this.userCollection
      .find({ _id: { $in: senderIds } })
      .project({ _id: 1, username: 1, pictureUrl: 1 })
      .toArray();

    const recipeIds = notifications.map(
      (notification) => new ObjectId(notification.recipeId)
    );

    const recipeInfo = await this.recipeCollection
      .find({ _id: { $in: recipeIds } })
      .project({ _id: 1, name: 1, imageUrls: 1 })
      .toArray();

    const allNotificationsInfo = notifications.map((notification) => {
      const sender = senderInfo.find(
        (s) => s._id.toString() == notification.senderId
      );
      const recipe = recipeInfo.find(
        (r) => r._id.toString() == notification.recipeId
      );
      return {
        _id: notification.id,
        type: notification.type,
        senderUsername: sender.username,
        senderPictureUrl: sender?.pictureUrl || "",
        recipeName: recipe.name,
        recipeId: recipe._id,
        recipeImageUrl: recipe.imageUrls?.[0] || "",
        date: notification.createdAt,
      };
    });

    return allNotificationsInfo;
  }

  async markNotificationRead(notificationId) {
    const id = new ObjectId(notificationId);
    const update = await this.collection.updateOne(
      { _id: id },
      { $set: { read: true } }
    );
    if (!update) {
      return "Notification not found";
    }
    return "Notification read";
  }
}

export const notificationStore = new NotificationStore();
