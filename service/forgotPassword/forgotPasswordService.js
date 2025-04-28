import { forgotPasswordStore } from "../../store/forgotPassword/forgotPasswordStore.js";
import { userStore } from "../../store/users/userStore.js";
import crypto from "crypto";

class ForgotPasswordService {
  constructor() {
    this.forgotPasswordStore = forgotPasswordStore;
    this.userStore = userStore;
  }
  async requestPasswordReset(email) {
    const userExists = await userStore.userExistsByEmail(email);
    if (!userExists) {
      return "User does not exist";
    } else {
      const generatedToken = crypto.randomBytes(20).toString("hex");
      const now = new Date();
      // expires in 1 hour
      const expiration = new Date(now.getTime() + 60 * 60 * 1000);
      const newToken = await forgotPasswordStore.createResetToken({
        token: generatedToken,
        email: email,
        expiresAt: expiration,
        used: false,
      });
    }
  }
}

export const forgotPassswordService = new ForgotPasswordService();
