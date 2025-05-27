import { recipeStatsCollection } from "../../store/reviews/recipeStatsSchema.js";
import { reviewStore } from "../../store/reviews/reviewStore.js";

class ReviewService {
  constructor() {
    this.reviewStore = reviewStore;
  }

  async addReview(userId, recipeId, rating, comment) {
    try {
      await this.reviewStore.addReview(userId, recipeId, rating, comment);
      return { success: true };
    } catch (err) {
      if (
        err.message === "User has already submitted a review for this recipe"
      ) {
        return { error: err.message };
      }
      throw err;
    }
  }

  async deleteReview(userId, recipeId) {
    try {
      await this.reviewStore.deleteReview(userId, recipeId);
      return { success: true };
    } catch (err) {
      if (err.message === "Review does not exist") {
        return { error: err.message };
      }
      throw err;
    }
  }

  async updateReview(userId, recipeId, fieldsToUpdate) {
    try {
      await this.reviewStore.updateReview(userId, recipeId, fieldsToUpdate);
      return { success: true };
    } catch (err) {
      if (err.message === "Review does not exist") {
        return { error: err.message };
      }
      throw err;
    }
  }

  async getRecipeStats(recipeId) {
    try {
      return await this.reviewStore.getRecipeStats(recipeId);
    } catch (err) {
      if (err.message === "Review not found") {
        return { error: err.message };
      }
      throw err;
    }
  }

  async getAllRecipeReviews(recipeId) {
    try {
      const result = await this.reviewStore.getAllRecipeReviews(recipeId);
      if (result.length === 0) {
        return { error: "No reviews for this recipe" };
      }
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }
}

export const reviewService = new ReviewService();
