import { userInfoStore } from "../../store/user-info/userInfoStore.js";

class UserInfoService {
  constructor() {
    this.userInfoStore = userInfoStore;
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
