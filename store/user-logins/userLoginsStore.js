import { getDatabase } from "../database.js";
import { userLoginsCollection } from "./userLoginsSchema.js";

class UserLoginsStore {
  constructor() {
    this.collection = null;
  }
  init() {
    const db = getDatabase();
    this.collection = db.collection(userLoginsCollection);
  }

  async updateUserLastLogin(userId, loginDate) {
    await this.collection.updateOne(
      { userId },
      { $set: { lastLogin: loginDate } },
      { upsert: true }
    );
  }

  async getUserLastLogin(userId) {
    const user = await this.collection.findOne({ userId });
    return user ? user.lastLogin : null;
  }

  // not sure how useful
  async updateUserLastSeenNotification(userId, seenDate) {
    await this.collection.updateOne(
      { userId },
      { $set: { lastSeenNotification: seenDate } }
    );
  }
}

export const userLoginsStore = new UserLoginsStore();
