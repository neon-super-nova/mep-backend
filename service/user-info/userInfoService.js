import { userInfoStore } from "../../store/user-info/userInfoStore.js";

class UserInfoService {
  constructor() {
    this.userInfoStore = userInfoStore;
  }

  async addUserInfo(
    userId,
    favoriteCuisine,
    favoriteMeal,
    favoriteDish,
    dietaryRestriction
  ) {
    try {
      await this.userInfoStore.addUserInfo(
        userId,
        favoriteCuisine,
        favoriteMeal,
        favoriteDish,
        dietaryRestriction
      );
      return { success: true };
    } catch (err) {
      if (err.message === "USER_NOT_FOUND") {
        return { error: "User not found" };
      } else if (err.message === "USER_INFO_ALREADY_EXISTS") {
        return { error: "User info already submitted" };
      }
      throw err;
    }
  }

  async updateUserInfo(userId, fieldsToUpdate) {
    try {
      await this.userInfoStore.updateUserInfo(userId, fieldsToUpdate);
      return { success: true };
    } catch (err) {
      if (err.message === "USER_NOT_FOUND") {
        return { error: "User not found" };
      } else if (err.message === "USER_INFO_NOT_FOUND") {
        return { error: "Cannot update not existing user info" };
      }
      throw err;
    }
  }

  // user-info getters
  async getUserInfo(userId) {
    try {
      return await this.userInfoStore.getUserInfo(userId);
    } catch (err) {
      if (err.message === "USER_NOT_FOUND") {
        return { error: "User not found" };
      }
      if (err.message === "EMPTY_USER_INFO") {
        return { error: "Empty user info" };
      }
      throw err;
    }
  }
}

export const userInfoService = new UserInfoService();
