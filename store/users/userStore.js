import { getDatabase } from "../database.js";
import bcrypt from "bcrypt";
import { ObjectId, ReturnDocument } from "mongodb";

class UserStore {
  constructor() {
    this.collection = null;
  }

  async init() {
    const db = getDatabase();
    this.collection = db.collection("users");
    console.log("User collection initialized");
  }

  async userExistsByEmail(email) {
    const user = await this.collection.findOne({ email });
    return !!user;
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
      firstName: newUser.firstName || "",
      lastName: newUser.lastName || "",
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
      // OAuth token check
      const oauthTokenField = `${user.oauthProvider}Token`; // e.g. googleToken
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
    return await this.collection.findOne({ username });
  }

  async findByEmail(email) {
    return await this.collection.findOne({ email });
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
    return result.modifiedCount > 0;
  }

  // Google OAuth helpers
  async findGoogleUser(email) {
    return await this.collection.findOne({ email });
  }

  async registerGoogleUser(profile) {
    const newUser = {
      username: profile.email,
      email: profile.email,
      firstName: profile.name?.split(" ")[0] || "",
      lastName: profile.name?.split(" ")[1] || "",
      googleToken: profile.googleToken, // changes
      googleRefreshToken: profile.googleRefreshToken, // changes
      oauthProvider: "google",
      verified: true,
    };
    const insertResult = await this.collection.insertOne(newUser);
    return { ...newUser, _id: insertResult.insertedId };
  }

  // updating userProfile picture:
  async updateUserPictureUrl(userId, pictureUrl) {
    const id = new ObjectId(userId);
    const user = await this.collection.findOne({ _id: id });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: { pictureUrl } },
      { returnDocument: "after" }
    );
    return result;
  }
}

export const userStore = new UserStore();
