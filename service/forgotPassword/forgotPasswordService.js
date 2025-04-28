import { forgotPasswordStore } from "../../store/forgotPassword/forgotPasswordStore.js";
import { userStore } from "../../store/users/userStore.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../../config/forgotPasswordEmail.js";

class ForgotPasswordService {
  constructor() {
    this.forgotPasswordStore = forgotPasswordStore;
    this.userStore = userStore;
  }

  async requestPasswordReset(email) {
    const userExists = await this.userStore.userExistsByEmail(email);
    if (!userExists) {
      return "User does not exist";
    }
    const generatedToken = crypto.randomBytes(20).toString("hex");
    const now = new Date();
    // expires in 1 hour
    const expiration = new Date(now.getTime() + 60 * 60 * 1000);
    await this.forgotPasswordStore.createResetToken({
      token: generatedToken,
      email: email,
      expiresAt: expiration,
      used: false,
    });

    await sendPasswordResetEmail(email, generatedToken);
    return "User found. Email sent";
  }
}

export const forgotPasswordService = new ForgotPasswordService();
