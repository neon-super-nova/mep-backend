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

  async addUserInfo(
    userId,
    favoriteCuisine,
    favoriteMeal,
    favoriteDish,
    dietaryRestriction = ""
  ) {
    const findUser = await this.findUser(userId);
    if (!findUser) {
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
    const findUser = await this.findUser(userId);
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

  //user-info getters
  async getUserInfo(userId) {
    const findUser = await this.findUser(userId);
    if (!findUser) {
      throw new Error("USER_NOT_FOUND");
    }
    const result = await this.collection.findOne(
      { userId },
      {
        projection: {
          _id: 0,
          favoriteCuisine: 1,
          favoriteMeal: 1,
          favoriteDish: 1,
          dietaryRestriction: 1,
        },
      }
    );
    return result || null;
  }
}

export const userInfoStore = new UserInfoStore();
