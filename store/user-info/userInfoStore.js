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
}

export const userInfoStore = new UserInfoStore();
