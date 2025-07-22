import { likeStore } from "../../store/likes/likeStore.js";

class LikeService {
  constructor() {
    this.likeStore = likeStore;
  }

  async like(userId, recipeId) {
    try {
      await likeStore.likeRecipe(userId, recipeId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
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
