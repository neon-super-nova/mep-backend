import { reviewStore } from "../../store/reviews/reviewStore";

class ReviewService {
  constructor() {
    this.reviewStore = reviewStore;
  }

  async addReview(userId, recipeId, rating, comment) {
    try {
      await this.reviewStore.addReview(userId, recipeId, rating, comment);
      return { success: true };
    } catch (err) {
      if (err.message === "Review does not exist") {
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
      const result = await this.reviewStore.getRecipeAverageRating(recipeId);
      return result;
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
      return result.toArray();
    } catch (err) {
      if (err.message === "No reviews found") {
        return { error: err.message };
      }
      throw err;
    }
  }
}
