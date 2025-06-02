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
      const fullUserData = await this.userStore.findByUsername(user.username);
      const tokenPayload = {
        userId: fullUserData._id.toString(),
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
      return { success: false, message: "Invalid token" };
    }
    await this.userStore.updatePassword(email, newPassword);
    await this.forgotPasswordStore.markTokenUsed(token);
    return { success: true };
  }

  async patchUser(userId, patchFields) {
    const update = await this.userStore.patchUser(userId, patchFields);
    if (update) {
      return { success: true };
    } else {
      return { success: false, message: "No changes made or user not found" };
    }
  }

  // Google OAuth
  async loginWithGoogle(profile) {
    const user = await this.userStore.findGoogleUser(profile.email);

    if (!user) {
      return { success: false, message: "User not found, please register" };
    }

    if (
      user.googleToken !== profile.accessToken ||
      user.googleRefreshToken !== profile.refreshToken
    ) {
      await this.userStore.patchUser(user._id.toString(), {
        googleToken: profile.accessToken,
        googleRefreshToken: profile.refreshToken,
      });
    }

    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username || user.email,
    };
    const token = generateToken(tokenPayload);

    return { success: true, token, user };
  }

  async registerWithGoogle(profile) {
    const existingUser = await this.userStore.findGoogleUser(profile.email);
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }

    const newUser = await this.userStore.registerGoogleUser({
      email: profile.email,
      name: `${profile.firstName} ${profile.lastName}`.trim(),
      googleToken: profile.accessToken,
      googleRefreshToken: profile.refreshToken,
      oauthProvider: "google",
      verified: true,
    });

    const tokenPayload = {
      userId: newUser._id.toString(),
      username: newUser.username || newUser.email,
    };
    const token = generateToken(tokenPayload);

    return { success: true, token, user: newUser };
  }
  // adding user picture
  async updateUserPictureUrl(userId, pictureUrl) {
    try {
      return await this.userStore.updateUserPictureUrl(userId, pictureUrl);
    } catch (err) {
      if (err.message === "USER_NOT_FOUND") {
        return { error: "User not found" };
      }
      throw err;
    }
  }

  // user getters
  async getUser(userId) {
    try {
      return await this.userStore.getUser(userId);
    } catch (err) {
      if (err.message === "USER_NOT_FOUND") {
        return { err: "User not found" };
      }
      throw err;
    }
  }

  async getUserRecipeCount(userId) {
    try {
      return await this.userStore.getUserRecipeCount(userId);
    } catch (err) {
      if (err.message === "USER_NOT_FOUND") {
        return { err: "User not found" };
      }
      throw err;
    }
  }

  async getUserLikeCount(userId) {
    try {
      return await this.userStore.getUserLikeCount(userId);
    } catch (err) {
      if (err.message === "USER_NOT_FOUND") {
        return { err: "User not found" };
      }
      throw err;
    }
  }
}

export const userService = new UserService();
