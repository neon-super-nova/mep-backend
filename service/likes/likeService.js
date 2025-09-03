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
      await this.likeStore.likeRecipe(userId, recipeId);
      const recipe = await this.recipeStore.getRecipeById(recipeId);
      if (recipe && recipe.userId != userId) {
        await this.notificationStore.createNotification(
          "like",
          userId,
          recipe.userId,
          recipeId
        );
        console.log("sending like notification");
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async unlike(userId, recipeId) {
    try {
      await this.likeStore.unlikeRecipe(userId, recipeId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export const likeService = new LikeService();
