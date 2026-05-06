import mongoose from "mongoose";

const { ObjectId, Decimal128 } = mongoose.Types;

export const reviewCollection = "reviews";

export const reviewSchema = {
  userId: ObjectId,
  recipeId: ObjectId,
  rating: { type: Decimal128, min: 1, max: 5, required: true },
  comment: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
};
