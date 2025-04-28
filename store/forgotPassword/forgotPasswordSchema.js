import { Timestamp } from "mongodb";

export const forgotPasswordCollection = "forgot-password";

export const forgotPasswordSchema = {
  token: { type: String, required: true },
  user_email: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
};
