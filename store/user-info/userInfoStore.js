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

    const insertResult = await this.collection.insertOne({
      userId,
      favoriteCuisine,
      favoriteMeal,
      favoriteDish,
      dietaryRestriction,
    });

    const insertedDoc = await this.collection.findOne({
      _id: insertResult.insertedId,
    });

    return insertedDoc;
  }

  async updateUserInfo(userId, fieldsToUpdate) {
    const exists = await this.checkForPreviousInfo(userId);
    if (!exists) {
      throw new Error("USER_INFO_NOT_FOUND");
    }

    const query = await this.collection.findOneAndUpdate(
      { userId },
      { $set: fieldsToUpdate },
      { returnDocument: "after", projection: { _id: 0 } }
    );

    return query.value;
  }

  //user-info getters

  async getUserInfo(userId) {
    const exists = await this.checkForPreviousInfo(userId);
    if (!exists) return null;

    return await this.collection.findOne(
      { userId },
      { projection: { _id: 0 } }
    );
  }
}

export const userInfoStore = new UserInfoStore();
