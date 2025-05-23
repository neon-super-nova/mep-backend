import { likeStore } from "../../store/likes/likeStore.js";

class LikeService {
  constructor() {
    this.likeStore = likeStore;
  }

  async like(userId, recipeId) {
    try {
      await this.likeStore.likeRecipe(userId, recipeId);
      return { success: "Recipe liked" };
    } catch (err) {
      if (err.message === "Recipe has already been liked") {
        return { error: err.message };
      }
      throw err;
    }
  }

  async unlike(userId, recipeId) {
    try {
      await likeStore.unlikeRecipe(userId, recipeId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export const likeService = new LikeService();
