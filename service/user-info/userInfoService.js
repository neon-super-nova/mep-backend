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
      const result = await this.userInfoStore.addUserInfo(
        userId,
        favoriteCuisine,
        favoriteMeal,
        favoriteDish,
        dietaryRestriction
      );
      return { success: true, result };
    } catch (err) {
      if (err.message === "USER_NOT_FOUND") {
        return { success: false, error: "User not found" };
      }
      if (err.message === "USER_INFO_ALREADY_EXISTS") {
        return { success: false, error: "User info already exists" };
      }
      throw err;
    }
  }

  async updateUserInfo(userId, fieldsToUpdate) {
    const updated = await this.userInfoStore.updateUserInfo(
      userId,
      fieldsToUpdate
    );
    return { success: true, userInfo: updated };
  }

  async getUserInfo(userId) {
    const userInfo = await this.userInfoStore.getUserInfo(userId);
    if (!userInfo) {
      return {
        success: true,
        empty: true,
        userInfo: {
          favoriteCuisine: "",
          favoriteMeal: "",
          favoriteDish: "",
          dietaryRestriction: [],
        },
      };
    }
    return { success: true, userInfo };
  }
}

export const userInfoService = new UserInfoService();
