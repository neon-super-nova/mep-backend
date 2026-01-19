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
        const newReviewCount = recipeInfo.reviewCount
          ? recipeInfo.reviewCount + 1
          : 1;
        // const newReviewCount = recipeInfo.reviewCount + 1;

        const newAverageRating = recipeInfo.averageRating
          ? (recipeInfo.averageRating * recipeInfo.reviewCount + rating) /
            newReviewCount
          : rating;

        await this.recipeStatsCollection.updateOne(
          { recipeId },
          {
            $set: {
              averageRating: Number(newAverageRating.toFixed(2)),
              reviewCount: newReviewCount,
            },
          }
        );
      } else {
        // First review ever → insert new stats doc
        await this.recipeStatsCollection.updateOne(
          { recipeId },
          {
            $setOnInsert: {
              averageRating: Number(rating),
              reviewCount: 1,
            },
          },
          { upsert: true }
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async recalculateReviewStats(recipeId) {
    const reviews = await this.collection
      .find({ recipeId }, { projection: { rating: 1 } })
      .toArray();

    if (reviews.length === 0) {
      await this.recipeStatsCollection.updateOne(
        { recipeId: recipeId },
        {
          $set: {
            reviewCount: 0,
            averageRating: 0,
          },
        },
        { upsert: true }
      );
      return;
    }

    const newTotalRating = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );
    const newAverageRating = newTotalRating / reviews.length;
    await this.recipeStatsCollection.updateOne(
      { recipeId },
      {
        $set: {
          averageRating: newAverageRating,
          reviewCount: reviews.length,
        },
      },
      { upsert: true }
    );
  }

  async deleteReview(userId, recipeId) {
    const recipeCheck = await this.checkForRecipeId(recipeId);
    if (!recipeCheck) {
      throw new Error("RECIPE_NOT_FOUND");
    }

    const existingReview = await this.checkForExistingReview(userId, recipeId);
    if (!existingReview) {
      throw new Error("Review does not exist");
    }
    await this.collection.deleteOne({ userId, recipeId });

    // now, update recipeStats collection
    await this.recalculateReviewStats(recipeId);
  }

  // bulk delete
  async deleteReviewsByUser(userId) {
    const reviews = await this.collection
      .find({ userId }, { projection: { recipeId: 1 } })
      .toArray();
    const recipeIds = [...new Set(reviews.map((review) => review.recipeId))];
    if (recipeIds.length === 0) {
      return;
    }
    await this.collection.deleteMany({ userId });

    for (const recipeId of recipeIds) {
      await this.recalculateReviewStats(recipeId);
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
          { $set: { averageRating: Number(newAverageRating) } }
        );
      } else {
        // If no stats found, create one (edge case)
        await this.recipeStatsCollection.updateOne(
          { recipeId },
          {
            $setOnInsert: {
              averageRating: Number(newRating),
              reviewCount: 1,
            },
          },
          { upsert: true }
        );
      }
    }
  }

  async getRecipeStats(recipeId) {
    const recipeCheck = await this.checkForRecipeId(recipeId);
    if (!recipeCheck) {
      throw new Error("RECIPE_NOT_FOUND");
    }

    const recipeStats = await this.recipeStatsCollection.findOne({ recipeId });
    if (!recipeStats) {
      return "Recipe stats not available yet";
    } else {
      return {
        recipeId: recipeStats.recipeId,
        averageReview: recipeStats.averageRating,
        reviewCount: recipeStats.reviewCount,
        likeCount: recipeStats.likeCount,
      };
    }
  }

  async getAllRecipeReviews(recipeId) {
    const recipeCheck = await this.checkForRecipeId(recipeId);
    if (!recipeCheck) {
      throw new Error("RECIPE_NOT_FOUND");
    }

    const reviewCheck = await this.collection.findOne({ recipeId });
    if (!reviewCheck) {
      return [];
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
                  _id: 1,
                  username: 1,
                  pictureUrl: 1,
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
            userId: { $toString: "$reviewAuthor._id" },
            username: "$reviewAuthor.username",
            pictureUrl: "$reviewAuthor.pictureUrl",
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
