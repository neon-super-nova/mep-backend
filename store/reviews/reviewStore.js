import { reviewCollection } from "./reviewSchema.js";
import { getDatabase } from "../database.js";

class ReviewStore {
  constructor() {
    this.collection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection(reviewCollection);
  }

  async checkForExistingReview(userId, recipeId) {
    return Boolean(
      await this.collection.findOne({
        userId,
        recipeId,
      })
    );
  }

  async addReview(userId, recipeId, rating, comment = "") {
    const existingReview = await this.checkForExistingReview(userId, recipeId);
    if (existingReview) {
      throw new Error("User has already submitted a review for this recipe");
    }

    const review = {
      userId,
      recipeId,
      rating,
      comment,
      createdAt: new Date(),
    };
    await this.collection.insertOne(review);
  }

  async deleteReview(userId, recipeId) {
    const existingReview = await this.checkForExistingReview(userId, recipeId);
    if (!existingReview) {
      throw new Error("Review does not exist");
    }
    await this.collection.deleteOne({ userId, recipeId });
  }

  async updateReview(userId, recipeId) {
    const existingReview = await this.checkForExistingReview(userId, recipeId);
    if (!existingReview) {
      throw new Error("Review does not exist");
    }
    const fieldsToUpdate = {
      rating,
      comment,
      createdAt: newDate(),
    };
    await this.collection.updateOne(
      { userId, recipeId },
      { $set: fieldsToUpdate }
    );
  }

  async getReviewRating(userId, recipeId) {
    const review = await this.checkForExistingReview(userId, recipeId);
    if (!existingReview) {
      throw new Error("Review does not exist");
    }
    return review.rating;
  }

  async getAllRecipeReviews(recipeId) {
    const reviews = await this.collection.find({ recipeId }).toArray();
    if (reviews.length === 0) {
      throw new Error("No reviews found");
    }
    return reviews;
  }
}

export const reviewStore = new ReviewStore();
