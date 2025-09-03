export const userLoginsCollection = "user-logins";

export const userLoginsSchema = {
  userId: String,
  lastLogin: Date,
  lastSeenNotification: Date,
};
