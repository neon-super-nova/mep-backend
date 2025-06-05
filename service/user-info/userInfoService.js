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
  async getUserFavoriteCuisine(userId) {
    try {
      return await this.userInfoStore.getUserFavoriteCuisine(userId);
    } catch (err) {
      if (err.message === "USER_NOT_FOUND") {
        return { error: "User not found" };
      }
      throw err;
    }
  }

  async getUserFavoriteMeal(userId) {
    try {
      return await this.userInfoStore.getUserFavoriteMeal(userId);
    } catch (err) {
      if (err.message === "USER_NOT_FOUND") {
        return { error: "User not found" };
      }
      throw err;
    }
  }

  async getUserFavoriteDish(userId) {
    try {
      return await this.userInfoStore.getUserFavoriteDish(userId);
    } catch (err) {
      if (err.message === "USER_NOT_FOUND") {
        return { error: "User not found" };
      }
      throw err;
    }
  }

  async getUserDietaryRestriction(userId) {
    try {
      return await this.userInfoStore.getUserDietaryRestriction(userId);
    } catch (err) {
      if (err.message === "USER_NOT_FOUND") {
        return { error: "User not found" };
      }
      throw err;
    }
  }
}

export const userInfoService = new UserInfoService();
