import { getDatabase } from "../database.js";
import { ObjectId } from "mongodb";

class TopRatedRecipeStore {
  constructor() {
    this.collection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection("top-rated-recipes");
    this.recipeCollection = db.collection("recipes");
    this.recipeStatsCollection = db.collection("recipeStats");
  }

  //trending recipe functions

  async calculateGlobalAverageRating() {
    // calculates average of all recipe's average ratings
    const result = await this.recipeStatsCollection
      .aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$averageRating" }, // Average of all average ratings
          },
        },
      ])
      .toArray();

    return result[0] ? result[0].averageRating : 0;
  }

  async getTopRatedRecipes(minReviewCount = 1, limit = 2) {
    // Calculate a weighted rating per recipe using IMDb formula:
    // WR = (v / (v + m)) * R + (m / (v + m)) * C, where:
    // R = average rating for the recipe
    // v = number of reviews for the recipe
    // C = global average rating across all recipes
    // m = minimum number of reviews required to be listed (threshold)

    const C = await this.calculateGlobalAverageRating();
    const m = minReviewCount;

    // get all recipe stats from reviews with review count greater than 2, returns an object like:
    /* [
        { recipeId: ..., averageRating: 4.6, reviewCount: 8 },
        { recipeId: ..., averageRating: 4.2, reviewCount: 20 },
    ... ] */
    const stats = await this.recipeStatsCollection
      .find({ reviewCount: { $gte: m } })
      .toArray();

    // add the weighted rating to each recipe stats by using the WR formula to return:
    /* [ 
        { recipeId: ..., averageRating: 4.6, reviewCount: 8, weightedRating: 4.51},
    ... ] */
    const weightedRatingStats = stats.map((stat) => {
      const v = stat.reviewCount;
      const R = stat.averageRating;
      const weightedRating = (v / (v + m)) * R + (m / (v + m)) * C;
      return { ...stat, weightedRating };
    });

    // sort from highest to lowest weightedRating
    weightedRatingStats.sort((a, b) => b.weightedRating - a.weightedRating);

    // finally determine the top limit is (top 3 by default);
    const topRatedRecipes = weightedRatingStats.slice(0, limit);

    const topRatedRecipeIds = topRatedRecipes
      .map((stat) => {
        try {
          return new ObjectId(stat.recipeId);
        } catch (e) {
          console.error("Invalid recipeId");
          return null;
        }
      })
      .filter((id) => id !== null);

    const topRatedRecipeInfo = await this.recipeCollection
      .find({ _id: { $in: topRatedRecipeIds } })
      .toArray();

    const fullTopRatedRecipeInfo = topRatedRecipeInfo.map((recipe) => {
      const recipeStat = topRatedRecipes.find(
        (stat) => stat.recipeId === recipe._id.toString()
      );
      return {
        name: recipe.name,
        averageRating: recipeStat?.averageRating ?? 0,
        reviewCount: recipeStat?.reviewCount ?? 0,
        cuisineRegion: recipe.cuisineRegion,
        religiousRestriction: recipe.religiousRestriction,
        dietaryRestriction: recipe.dietaryRestriction,
        // can add return other attributes of recipe according to ui needs
      };
    });

    return fullTopRatedRecipeInfo;
  }

  async refreshTopRatedCache(minReviewCount = 1, limit = 2) {
    // recalculate and store the trending recipes in mongodb for later retrieval
    // first get the trending recipes with full details
    const topRatedRecipes = await this.getTopRatedRecipes(
      minReviewCount,
      limit
    );

    // insert a single cache document in trending-recipes table, using a fixed id "cache" so theres only 1 cache document
    const cacheDoc = {
      _id: "cache",
      updatedAt: new Date(),
      recipes: topRatedRecipes,
    };

    await this.collection.updateOne(
      { _id: cacheDoc._id },
      { $set: cacheDoc },
      { upsert: true }
    );
    return cacheDoc;
  }

  async getCachedTopRatedRecipes() {
    // fetch cached trending recipes stored in db
    const cacheRecipes = await this.collection.findOne({ _id: "cache" });
    return cacheRecipes?.recipes || [];
  }
}

export const topRatedRecipeStore = new TopRatedRecipeStore();
