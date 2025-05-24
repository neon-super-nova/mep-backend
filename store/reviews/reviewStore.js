import { reviewCollection } from "./reviewSchema.js";
import { recipeStatsCollection } from "./recipeStatsSchema.js";
import { getDatabase } from "../database.js";

class ReviewStore {
  constructor() {
    this.collection = null;
    this.recipeStatsCollection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection(reviewCollection);
    this.recipeStatsCollection = db.collection(recipeStatsCollection);
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

    // now, update recipeStats collection
    const recipeInfo = await this.recipeStatsCollection.findOne({ recipeId });
    if (recipeInfo) {
      const newReviewCount = recipeInfo.reviewCount + 1;
      const newAverageRating =
        (recipeInfo.averageRating * recipeInfo.reviewCount + rating) /
        newReviewCount;
      await this.recipeStatsCollection.updateOne(
        { recipeId: recipeId },
        {
          $set: {
            averageRating: newAverageRating,
            reviewCount: newReviewCount,
          },
        }
      );
    } else {
      await this.recipeStatsCollection.insertOne({
        recipeId,
        averageRating: rating,
        reviewCount: 1,
      });
    }
  }

  async deleteReview(userId, recipeId) {
    const existingReview = await this.checkForExistingReview(userId, recipeId);
    if (!existingReview) {
      throw new Error("Review does not exist");
    }
    await this.collection.deleteOne({ userId, recipeId });

    // now, update recipeStats collection
    const recipeInfo = await this.recipeStatsCollection.findOne({ recipeId });
    if (recipeInfo) {
      const newReviewCount = recipeInfo.reviewCount - 1;

      if (newReviewCount === 0) {
        // No reviews left, remove the summary document
        await this.recipeStatsCollection.deleteOne({ recipeId });
      } else {
        const totalRatingSum =
          recipeInfo.averageRating * recipeInfo.reviewCount;
        const newAverageRating = (totalRatingSum - rating) / newReviewCount;

        await this.recipeStatsCollection.updateOne(
          { recipeId },
          {
            $set: {
              averageRating: newAverageRating,
              reviewCount: newReviewCount,
            },
          }
        );
      }
    } else {
      // pass
    }
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
