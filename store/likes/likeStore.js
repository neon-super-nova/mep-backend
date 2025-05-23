import { likeCollection } from "./likeSchema.js";
import { recipeStore } from "../recipes/recipeStore.js";
import { getDatabase } from "../database.js";

class LikeStore {
  constructor() {
    this.collection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection(likeCollection);
    this.recipeStore = recipeStore;
  }

  async checkForLike(userId, recipeId) {
    return Boolean(await this.collection.findOne({ userId, recipeId }));
  }

  async likeRecipe(userId, recipeId) {
    try {
      const alreadyLiked = await this.checkForLike(userId, recipeId);
      if (alreadyLiked) {
        throw new Error("Recipe has already been liked");
      }

      await this.collection.insertOne({
        userId: userId,
        recipeId: recipeId,
        createdAt: new Date(),
      });
      await this.recipeStore.incrementLikes(recipeId);
    } catch (err) {
      throw err;
    }
  }

  async unlikeRecipe(userId, recipeId) {
    try {
      const alreadyLiked = await this.checkForLike(userId, recipeId);
      if (!alreadyLiked) {
        throw new Error("Cannot unlike a recipe that wasn't liked before");
      }
      await this.collection.deleteOne({ userId, recipeId });
      await this.recipeStore.decrementLikes(recipeId);
    } catch (error) {
      throw error;
    }
  }
}

export const likeStore = new LikeStore();
