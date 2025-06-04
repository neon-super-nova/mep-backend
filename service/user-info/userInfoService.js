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
}

export const userInfoService = new UserInfoService();
