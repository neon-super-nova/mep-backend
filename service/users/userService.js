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
      // Generate verification token with just username
      const verificationToken = generateToken(
        { username: userData.username },
        "1d"
      );

      // Add verification token to userData
      const newUserDataWithToken = {
        ...userData,
        verificationToken,
      };

      // Save new user to DB
      await userStore.addNewUser(newUserDataWithToken);

      // Send verification email
      await sendVerificationEmail(userData.email, verificationToken);

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async isAuthenticated(user) {
    const authenticationStatus = await this.userStore.isAuthenticated(user);
    if (authenticationStatus === "SUCCESS") {
      const fullUserData = await this.userStore.findByUsername(user.username);
      const tokenPayload = {
        userId: fullUserData._id.toString(), // make sure it's a string
        username: fullUserData.username,
      };
      const token = generateToken(tokenPayload);
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
