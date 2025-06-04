import { getDatabase } from "../database.js";
import { forgotPasswordCollection } from "./forgotPasswordSchema.js";

class ForgotPasswordStore {
  constructor() {
    this.collection = null;
  }

  async init() {
    const db = getDatabase();
    this.collection = db.collection(forgotPasswordCollection);
  }

  async createResetToken({ token, email, expiresAt }) {
    const newToken = {
      token: token,
      user_email: email,
      expiresAt: expiresAt,
      used: false,
    };
    await this.collection.insertOne(newToken);
  }

  async findValidResetToken(token) {
    const now = new Date();
    const foundToken = await this.collection.findOne({
      token: token,
      used: false,
      expiresAt: { $gt: now },
    });

    return foundToken;
  }

  async markTokenUsed(token) {
    await this.collection.updateOne({ token: token }, { $set: { used: true } });
  }

  async deleteExpiredToken() {
    const now = new Date();
    await this.collection.deleteMany({
      $or: [{ expiresAt: { $lt: now } }, { used: true }],
    });
  }
}

export const forgotPasswordStore = new ForgotPasswordStore();
