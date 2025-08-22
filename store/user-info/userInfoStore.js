import { userInfoCollection } from "./userInfoSchema.js";
import { userCollection } from "../users/userSchema.js";
import { getDatabase } from "../database.js";
import { ObjectId } from "mongodb";

class UserInfoStore {
  constructuor() {
    this.collection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection(userInfoCollection);
    this.userCollection = db.collection(userCollection);
  }

  async findUser(userId) {
    const id = new ObjectId(userId);
    return Boolean(await this.userCollection.findOne({ _id: id }));
  }

  async checkForPreviousInfo(userId) {
    return Boolean(await this.collection.findOne({ userId }));
  }

  async updateUserInfo(userId, fieldsToUpdate) {
    const query = await this.collection.findOneAndUpdate(
      { userId },
      { $set: fieldsToUpdate },
      { upsert: true, returnDocument: "after", projection: { _id: 0 } }
    );

    return query.value;
  }

  //user-info getters

  async getUserInfo(userId) {
    const doc = await this.collection.findOne(
      { userId },
      { projection: { _id: 0 } }
    );
    return doc;
  }
}

export const userInfoStore = new UserInfoStore();
