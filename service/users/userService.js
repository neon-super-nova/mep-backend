import { userStore } from "../../store/users/userStore.js";

class UserService {
  constructor() {
    this.userStore = userStore;
  }

  async addNewUser(userData) {
    try {
      await this.userStore.addNewUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async isAuthenticated(user) {
    const authenticationStatus = await this.userStore.isAuthenticated(user);
    if (authenticationStatus === "SUCCESS") {
      return { success: true, message: "Login successful" };
    } else if (authenticationStatus === "CREDENTIAL_MISMATCH") {
      return { success: false, message: "Password mismatch" };
    } else if (authenticationStatus === "USER_NOT_FOUND") {
      return { success: false, message: "User not found" };
    }
  }
}

export const userService = new UserService();
