import { reviewCollection } from "./reviewSchema.js";
import { recipeStatsCollection } from "./recipeStatsSchema.js";
import { getDatabase } from "../database.js";
import { ObjectId } from "mongodb";

class ReviewStore {
  constructor() {
    this.collection = null;
    this.recipeStatsCollection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection(reviewCollection);
    this.recipeCollection = db.collection("recipes");
    this.recipeStatsCollection = db.collection(recipeStatsCollection);
  }

  async checkForRecipeId(recipeId) {
    const id = new ObjectId(recipeId);
    return Boolean(await this.recipeCollection.findOne({ _id: id }));
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
    try {
      const recipeCheck = await this.checkForRecipeId(recipeId);
      if (!recipeCheck) {
        throw new Error("RECIPE_NOT_FOUND");
      }

      const existingReview = await this.checkForExistingReview(
        userId,
        recipeId
      );
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
    } catch (err) {
      throw err;
    }
  }

  async deleteReview(userId, recipeId) {
    try {
      const recipeCheck = await this.checkForRecipeId(recipeId);
      if (!recipeCheck) {
        throw new Error("RECIPE_NOT_FOUND");
      }

      const existingReview = await this.checkForExistingReview(
        userId,
        recipeId
      );
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
    } catch (err) {
      throw err;
    }
  }

  async updateReview(userId, recipeId, fieldsToUpdate) {
    const recipeCheck = await this.checkForRecipeId(recipeId);
    if (!recipeCheck) {
      throw new Error("RECIPE_NOT_FOUND");
    }

    const existingReview = await this.checkForExistingReview(userId, recipeId);
    if (!existingReview) {
      throw new Error("Review does not exist");
    }

    const oldRating = existingReview.rating;
    const newRating = fieldsToUpdate.rating;

    fieldsToUpdate.createdAt = new Date();
    await this.collection.updateOne(
      { userId, recipeId },
      { $set: fieldsToUpdate }
    );

    if (newRating !== null && newRating !== oldRating) {
      const recipeStats = await this.recipeStatsCollection.findOne({
        recipeId,
      });

      if (recipeStats) {
        // need to update new rating properly in recipeStats collection
        const reviewCount = recipeStats.reviewCount;
        // Calculate new average rating
        // Remove old rating and add new rating, weighted by reviewCount
        const totalRatingSum = recipeStats.averageRating * reviewCount;
        const newTotalRatingSum = totalRatingSum - oldRating + newRating;
        const newAverageRating = newTotalRatingSum / reviewCount;

        await this.recipeStatsCollection.updateOne(
          { recipeId },
          { $set: { averageRating: newAverageRating } }
        );
      } else {
        // If no stats found, create one (edge case)
        await this.recipeStatsCollection.insertOne({
          recipeId,
          averageRating: newRating,
          reviewCount: 1,
        });
      }
    }
  }

  async getRecipeStats(recipeId) {
    const review = await this.recipeStatsCollection.findOne({ recipeId });
    if (!review) {
      throw new Error("Review not found");
    }
    return {
      recipeId: review.recipeId,
      averageReview: review.averageRating,
      reviewCount: review.reviewCount,
      likeCount: review.likeCount,
    };
  }

  async getAllRecipeReviews(recipeId) {
    const recipeCheck = await this.checkForRecipeId(recipeId);
    if (!recipeCheck) {
      throw new Error("RECIPE_NOT_FOUND");
    }

    const reviews = await this.collection
      .aggregate([
        {
          $match: { recipeId: recipeId },
        },
        {
          $lookup: {
            from: "users",
            let: { userIdStr: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", { $toObjectId: "$$userIdStr" }],
                  },
                },
              },
              {
                $project: {
                  username: 1,
                },
              },
            ],
            as: "reviewAuthor",
          },
        },
        { $unwind: "$reviewAuthor" },
        {
          $project: {
            recipeId: 1,
            username: "$reviewAuthor.username",
            rating: 1,
            comment: 1,
            createdAt: 1,
          },
        },
      ])
      .toArray();

    return reviews || [];
  }
}

export const reviewStore = new ReviewStore();
