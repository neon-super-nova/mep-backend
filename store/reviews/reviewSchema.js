import { ObjectId } from "mongodb";

export const reviewCollection = "reviews";

export const reviewSchema = {
  userId: ObjectId,
  recipeId: ObjectId,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
};
