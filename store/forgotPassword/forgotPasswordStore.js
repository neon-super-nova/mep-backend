import { getDatabase } from "../database";
import { forgotPasswordCollection } from "./forgotPasswordSchema";

class ForgotPasswordStore {
  constructor() {
    this.collection = null;
  }

  async init() {
    const db = getDatabase();
    this.collection = db.collection(forgotPasswordCollection);
    console.log("ForgotPassword collection successfully initialized");
  }

  async createResetToken({ email, token, expiresAt }) {
    const newToken = {
      user_email: email,
      token: token,
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
      expiresAt: { $lt: now },
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
