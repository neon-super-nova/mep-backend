import { userInfoStore } from "../../store/user-info/userInfoStore.js";
import { userLoginsStore } from "../../store/user-logins/userLoginsStore.js";

class UserInfoService {
  constructor() {
    this.userInfoStore = userInfoStore;
    this.userLoginsStore = userLoginsStore;
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

  async getUserLastLogin(userId) {
    const lastLogin = await this.userLoginsStore.getUserLastLogin(userId);
    return lastLogin;
  }
}

export const userInfoService = new UserInfoService();
