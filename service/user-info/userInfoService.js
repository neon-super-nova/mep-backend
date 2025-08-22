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
    try {
      const updated = await this.userInfoStore.updateUserInfo(
        userId,
        fieldsToUpdate
      );
      const fresh = await this.userInfoStore.getUserInfo(userId); // refetch to be sure
      return { success: true, userInfo: fresh };
    } catch (err) {
      if (err.message === "USER_INFO_NOT_FOUND") {
        return { success: false, error: "User info not found" };
      }
      throw err;
    }
  }

  async getUserInfo(userId) {
    const userInfo = await this.userInfoStore.getUserInfo(userId);
    if (!userInfo) return { success: false };
    return { success: true, userInfo };
  }
}

export const userInfoService = new UserInfoService();
