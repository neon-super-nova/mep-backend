import passport from "passport";
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

  async userExistsByEmail(email) {
    const check = await this.collection.findOne({
      email: email,
    });
    if (check) {
      return true;
    } else {
      return false;
    }
  }

  async addNewUser(newUser) {
    const existingUserCheck = await this.collection.findOne({
      $or: [{ username: newUser.username }, { email: newUser.email }],
    });
    if (existingUserCheck) {
      throw new Error("User already registered");
    }
    const newUserData = {
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };

    if (newUser.password) {
      newUserData.password = await bcrypt.hash(newUser.password, 10);
    }

    if (newUser.facebookToken) {
      newUserData.facebookToken = newUser.facebookToken;
    }

    if (newUser.googleToken) {
      newUserData.googleToken = newUser.googleToken;
    }

    if (newUser.appleToken) {
      newUserData.appleToken = newUser.appleToken;
    }

    if (newUser.oauthProvider) {
      newUserData.oauthProvider = newUser.oauthProvider;
    }

    await this.collection.insertOne(newUserData);
  }

  async isAuthenticated(user) {
    const foundUser = await this.collection.findOne({
      username: user.username,
    });
    if (!foundUser) {
      return "USER_NOT_FOUND";
    }

    if (user.password) {
      const isPasswordCorrect = await bcrypt.compare(
        user.password,
        foundUser.password
      );
      return isPasswordCorrect ? "SUCCESS" : "CREDENTIAL_MISMATCH";
    }

    if (user.oauthProvider) {
      const oauthTokenField = `${user.oauthProvider}Token`; // e.g., "facebookToken"

      if (
        foundUser[oauthTokenField] &&
        foundUser[oauthTokenField] === user.oauthToken
      ) {
        return "SUCCESS";
      } else {
        return "CREDENTIAL_MISMATCH";
      }
    }

    return "CREDENTIALS_MISMATCH";
  }

  async updatePassword(email, newPassword) {
    const trimmedEmail = email.trim();
    const trimmedPassword = newPassword.trim();
    const userExists = await this.userExistsByEmail(trimmedEmail);
    if (!userExists) {
      return "User not found";
    }
    const newHashedPassword = await bcrypt.hash(trimmedPassword, 10);
    await this.collection.updateOne(
      { email: trimmedEmail },
      { $set: { password: newHashedPassword } }
    );
    return "Password updated";
  }
}

export const userStore = new UserStore();
