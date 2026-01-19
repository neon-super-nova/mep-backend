import { likeStore } from "../../store/likes/likeStore.js";
import { recipeStore } from "../../store/recipes/recipeStore.js";
import { notificationStore } from "../../store/notifications/notificationStore.js";

class LikeService {
  constructor() {
    this.likeStore = likeStore;
    this.recipeStore = recipeStore;
    this.notificationStore = notificationStore;
  }

  async like(userId, recipeId) {
    try {
      const likeStatus = await this.likeStore.likeRecipe(userId, recipeId);
      if (likeStatus.status === "Recipe liked") {
        const recipe = await this.recipeStore.getRecipeById(recipeId);
        if (recipe && recipe.userId != userId) {
          await this.notificationStore.createNotification(
            "like",
            userId,
            recipe.userId,
            recipeId
          );
        }
      }
      return { success: true, status: likeStatus.status };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getLikeStatus(userId, recipeId) {
    try {
      const status = await this.likeStore.checkForLike(userId, recipeId);
      return { success: true, likeStatus: status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const likeService = new LikeService();
