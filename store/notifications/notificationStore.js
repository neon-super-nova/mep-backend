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
  }

  async createNotification() {}

  async getNotifications() {}

  async markNotificationRead() {}
}
