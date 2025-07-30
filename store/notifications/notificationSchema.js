export const notificationCollection = "notifications";

export const notificationSchema = {
  // _id
  type: {
    type: String,
    enum: ["like", "review"],
  },
  senderId: String,
  recipientId: String,
  recipeId: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  read: {
    type: Boolean,
    default: false,
  },
};
