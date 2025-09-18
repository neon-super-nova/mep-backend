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

  async getNotifications(recipientId, limit = 5) {
    const notifications = await this.collection
      .aggregate([
        {
          $match: {
            recipientId,
            read: false,
          },
        },
        {
          $group: {
            _id: { recipeId: "$recipeId", type: "$type" },
            senders: { $push: "$senderId" },
            createdAt: { $max: "$createdAt" },
            notificationIds: { $push: "$_id" },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: limit },
        {
          $project: {
            notificationIds: 1,
            recipeId: "$_id.recipeId",
            type: "$_id.type",
            senders: 1,
            createdAt: 1,
            _id: 0,
          },
        },
      ])
      .toArray();

    // need to return senderId picture, senderId username, recipe name, recipe.imageUrls[0]?
    if (notifications.length === 0) {
      return [];
    }

    const senderIds = notifications.flatMap((notification) =>
      (notification.senders || []).map((id) => new ObjectId(id))
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
      const recipe = recipeInfo.find(
        (r) => r._id.toString() == notification.recipeId
      );
      const firstSender = senderInfo.find(
        (s) => s._id.toString() == notification.senders[0]
      );
      const otherSendersCount = (notification.senders?.length || 0) - 1;

      return {
        id: notification.notificationIds,
        type: notification.type,
        recipeName: recipe?.name,
        recipeId: recipe?._id,
        recipeImageUrl: recipe?.imageUrls?.[0] || "",
        date: notification.createdAt,
        firstSenderUsername: firstSender?.username,
        senderPictureUrl: firstSender?.pictureUrl || "",
        otherSendersCount,
        message:
          otherSendersCount > 0
            ? `${firstSender?.username} and ${otherSendersCount} other user(s) ${notification.type}d your recipe`
            : `${firstSender?.username} ${notification.type}d your recipe`,
      };
    });

    return allNotificationsInfo;
  }

  async markNotificationRead(notificationIds) {
    const ids = notificationIds.map((n) => new ObjectId(n));
    const update = await this.collection.updateOne(
      { _id: { $in: ids } },
      { $set: { read: true } }
    );
    if (!update) {
      return "Notification not found";
    }
    return update;
  }

  // method to delete read:true notifications every n amount of days
}

export const notificationStore = new NotificationStore();
