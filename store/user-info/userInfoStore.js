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

  async checkForPreviousInfo(userId) {
    return Boolean(await this.collection.findOne({ userId }));
  }

  async addUserInfo(
    userId,
    favoriteCuisine,
    favoriteMeal,
    favoriteDish,
    dietaryRestriction = ""
  ) {
    const id = new ObjectId(userId);
    const user = await this.userCollection.findOne({ _id: id });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const check = await this.checkForPreviousInfo(userId);
    if (check) {
      throw new Error("USER_INFO_ALREADY_EXISTS");
    }

    const userInfoToAdd = {
      userId,
      favoriteCuisine,
      favoriteMeal,
      favoriteDish,
      dietaryRestriction,
    };
    await this.collection.insertOne(userInfoToAdd);
  }

  async updateUserInfo(userId, fieldsToUpdate) {
    const id = new ObjectId(userId);
    const findUser = await this.userCollection.findOne({ _id: id });
    if (!findUser) {
      throw new Error("USER_NOT_FOUND");
    }

    const checkForPreviousInfo = await this.checkForPreviousInfo(userId);
    if (!checkForPreviousInfo) {
      throw new Error("USER_INFO_NOT_FOUND");
    }

    return await this.collection.updateOne(
      { userId },
      { $set: fieldsToUpdate }
    );
  }
}

export const userInfoStore = new UserInfoStore();
