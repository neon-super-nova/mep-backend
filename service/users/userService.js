import { userStore } from "../../store/users/userStore.js";
import { generateToken } from "../../config/serverSessions/jwt.js";
import { sendVerificationEmail } from "../../config/serverEmails/emailVerification.js";
import { forgotPasswordStore } from "../../store/forgotPassword/forgotPasswordStore.js";

class UserService {
  constructor() {
    this.userStore = userStore;
    this.forgotPasswordStore = forgotPasswordStore;
  }

  async addNewUser(userData) {
    try {
      const verificationToken = generateToken(
        { username: userData.username },
        "1d"
      );
      // add verificationToken to userData to send to store
      const newUserDataWithToken = {
        ...userData,
        verificationToken,
      };
      await this.userStore.addNewUser(newUserDataWithToken);
      await sendVerificationEmail(userData.email, verificationToken);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async isAuthenticated(user) {
    const authenticationStatus = await this.userStore.isAuthenticated(user);
    if (authenticationStatus === "SUCCESS") {
      const token = generateToken({ username: user.username });
      return { success: true, token };
    } else if (authenticationStatus === "CREDENTIAL_MISMATCH") {
      return { success: false, message: "Password mismatch" };
    } else if (authenticationStatus === "USER_NOT_FOUND") {
      return { success: false, message: "User not found" };
    }
  }

  async verifyEmail(token) {
    const isVerified = await this.userStore.verifyEmail(token);
    if (isVerified === "Email successfully verified") {
      return { success: true };
    } else {
      return { success: false };
    }
  }

  async updatePassword(email, newPassword, token) {
    const verifyToken = await this.forgotPasswordStore.findValidResetToken(
      token
    );
    if (!verifyToken) {
      return "Invalid token";
    }
    await this.userStore.updatePassword(email, newPassword);
    await this.forgotPasswordStore.markTokenUsed(token);
    return { success: true };
  }

  async patchUser(userId, pathFields) {
    const update = await this.userStore.patchUser(userId, pathFields);
    if (update) {
      return { success: true };
    } else {
      return { success: false, message: "No changes made or user not found" };
    }
  }
}

export const userService = new UserService();
