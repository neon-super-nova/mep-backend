import { ObjectId } from "mongodb";

export const recipeStatsCollection = "recipeStats";

export const recipeStatsSchema = {
  recipeId: ObjectId,
  averageRating: Number,
  reviewCount: Number,
};
