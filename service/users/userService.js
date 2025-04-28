import { userStore } from "../../store/users/userStore.js";
import { generateToken } from "../../config/jwt.js";
import { sendVerificationEmail } from "../../config/emailVerification.js";

class UserService {
  constructor() {
    this.userStore = userStore;
  }

  async addNewUser(userData) {
    try {
      await this.userStore.addNewUser(userData);
      const verificationToken = generateToken(
        { username: userData.username },
        "1d"
      );
      // await sendVerificationEmail(userData.email, verificationToken);

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
}

export const userService = new UserService();
