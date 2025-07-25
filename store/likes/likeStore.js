import { likeCollection } from "./likeSchema.js";
import { getDatabase } from "../database.js";
import { ObjectId } from "mongodb";

class LikeStore {
  constructor() {
    this.collection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection(likeCollection);
    this.recipeCollection = db.collection("recipes");
    this.recipeStatsCollection = db.collection("recipeStats");
  }

  async checkForRecipeId(recipeId) {
    const id = new ObjectId(recipeId);
    return Boolean(await this.recipeCollection.findOne({ _id: id }));
  }

  async checkForLike(userId, recipeId) {
    return Boolean(await this.collection.findOne({ userId, recipeId }));
  }

  async likeRecipe(userId, recipeId) {
    const recipeCheck = await this.checkForRecipeId(recipeId);
    if (!recipeCheck) {
      throw new Error("RECIPE_NOT_FOUND");
    }

    const alreadyLiked = await this.checkForLike(userId, recipeId);
    if (alreadyLiked) {
      throw new Error("Recipe has already been liked");
    }

    await this.collection.insertOne({
      userId: userId,
      recipeId: recipeId,
      createdAt: new Date(),
    });
    await this.recipeStatsCollection.updateOne(
      { recipeId },
      { $inc: { likeCount: 1 } },
      { upsert: true }
    );
    return { success: true };
  }

  async unlikeRecipe(userId, recipeId) {
    const recipeCheck = await this.checkForRecipeId(recipeId);
    if (!recipeCheck) {
      throw new Error("RECIPE_NOT_FOUND");
    }

    const alreadyLiked = await this.checkForLike(userId, recipeId);
    if (!alreadyLiked) {
      throw new Error("Cannot unlike a recipe that wasn't liked before");
    }

    await this.collection.deleteOne({ userId, recipeId });
    await this.recipeStatsCollection.updateOne(
      { recipeId },
      { $inc: { likeCount: -1 } }
    );
    return { success: true };
  }
}

export const likeStore = new LikeStore();
