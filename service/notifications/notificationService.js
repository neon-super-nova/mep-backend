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

  async markNotificationAsRead(notificationId) {
    const update = await this.notificationStore.markNotificationRead(
      notificationId
    );
    if (update === "Notification marked read") {
      return { success: true };
    }
    return { success: false };
  }
}

export const notificationService = new NotificationService();
