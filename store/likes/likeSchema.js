import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

export const likeCollection = "likes";

export const likeSchema = {
  userId: ObjectId,
  recipeId: ObjectId,
  createdAt: { type: Date, default: Date.now },
};
