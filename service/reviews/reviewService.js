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
      if ((err.message = "Review does not exist")) {
        return { error: err.message };
      }
      throw err;
    }
  }

  async deleteReview(userId, recipeId) {}

  async updateReview(userId, recipeId, fieldsToUpdate) {}

  async getReviewRating() {}

  async getAllRecipeReviews() {}
}
