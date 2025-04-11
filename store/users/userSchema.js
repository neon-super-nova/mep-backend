export const userCollection = "users";

export const userSchema = {
  userId: Number,
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  email: String,
  facebookToken: { type: String, default: null },
  googleToken: { type: String, default: null },
  appleToken: { type: String, default: null },
  oauthProvider: {
    type: String,
    enum: ["facebook", "google", "apple"],
    default: null,
  },
};
