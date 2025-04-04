import { getDatabase } from "../database.js";
import bcrypt from "bcrypt";

class UserStore {
  constructor() {
    this.collection = null;
  }

  async init() {
    const db = getDatabase();
    this.collection = db.collection("users");
    console.log("Collection initialized successfully");
  }

  async addNewUser(newUser) {
    const existingUserCheck = await this.collection.findOne({
      $or: [{ username: newUser.username }, { email: newUser.email }],
    });
    if (existingUserCheck) {
      throw new Error("User already registered");
    }

    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const newUserData = {
      username: newUser.username,
      password: hashedPassword,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };
    await this.collection.insertOne(newUserData);
  }

  async isAuthenticated(user) {
    const foundUser = await this.collection.findOne({
      username: user.username,
    });
    if (!foundUser) {
      return "USER_NOT_FOUND";
    }
    const isPasswordCorrect = await bcrypt.compare(
      user.password,
      foundUser.password
    );
    return isPasswordCorrect ? "SUCCESS" : "CREDENTIAL_MISMATCH";
  }
}

export const userStore = new UserStore();
