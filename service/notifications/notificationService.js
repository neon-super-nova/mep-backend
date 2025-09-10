import { notificationStore } from "../../store/notifications/notificationStore.js";
import { userLoginsStore } from "../../store/user-logins/userLoginsStore.js";

class NotificationService {
  constructor() {
    this.notificationStore = notificationStore;
    this.userLoginsStore = userLoginsStore;
  }

  async getNotifications(recipientId) {
    // const lastLoginDate = await this.userLoginsStore.getUserLastLogin(
    //   recipientId
    // );
    const notifications = await this.notificationStore.getNotifications(
      recipientId,
      5
    );
    return notifications || [];
  }
}

export const notificationService = new NotificationService();
