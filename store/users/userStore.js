import passport from "passport";
import { getDatabase } from "../database.js";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

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
    const existingUser = await this.collection.findOne({
      $or: [{ username: newUser.username }, { email: newUser.email }],
    });

    if (existingUser) {
      throw new Error("User already registered");
    }

    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    const userData = {
      username: newUser.username,
      email: newUser.email,
      password: hashedPassword,
      verified: false,
      verificationToken: newUser.verificationToken,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };

    await this.collection.insertOne(userData);
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

  async findByUsername(username) {
    return this.collection.findOne({ username });
  }

  async verifyEmail(token) {
    const user = await this.collection.findOne({ verificationToken: token });
    if (!user) {
      return "Invalid token";
    }
    await this.collection.updateOne(
      { _id: user._id },
      { $set: { verified: true }, $unset: { verificationToken: "" } }
    );
    return "Email successfully verified";
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

  async patchUser(userId, patchFields) {
    const objectId = ObjectId.createFromHexString(userId);
    const result = await this.collection.updateOne(
      { _id: objectId },
      { $set: patchFields }
    );
    // true if 1 (only possible number of updates) was modified
    return result.modifiedCount > 0;
  }
}

export const userStore = new UserStore();
