import { ObjectId } from "mongodb";

export const likeCollection = "likes";

export const likeSchema = {
  userId: ObjectId,
  recipeId: ObjectId,
  createdAt: { type: Date, default: Date.now },
};
