import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

export const recipeStatsCollection = "recipeStats";

export const recipeStatsSchema = {
  recipeId: ObjectId,
  averageRating: Number,
  reviewCount: Number,
  likeCount: Number,
};
