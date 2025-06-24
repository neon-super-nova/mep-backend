import { getDatabase } from "../database.js";

class TrendingRecipeStore {
  // trending recipes means = most liked recipes within the past week
  constructor() {
    this.collection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection("trending-recipes");
    this.recipeCollection = db.collection("recipes");
    this.likesCollection = db.collection("likes");
  }

  async getTrendingRecipes() {
    const now = new Date();
    const pastWeek = new Date(now);
    pastWeek.setDate(pastWeek.getDate() - 7);

    const pipeline = [
      // only reviews within the past week
      { $match: { createdAt: { $gte: pastWeek } } },
      // group by likes:
      {
        $group: {
          _id: "$recipeId",
          totalLikes: { $sum: 1 },
        },
      },
      // sort them in desc order from most liked
      { $sort: { totalLikes: -1 } },
      // limit the result to the top 3 recipes
      { $limit: 3 },
      // join  each of those top recipe IDs with the actual recipe data from the recipes collection
      {
        $lookup: {
          from: "recipes",
          localField: "_id",
          foreignField: "_id",
          as: "recipeDetails",
        },
      },
      // unwind the joined recipe data so it’s not in an array
      { $unwind: "$recipeDetails" },
      // Project only the fields we care about: Recipe name, Cuisine region, Dietary restriction, Religious restriction, Total likes
      {
        $project: {
          name: "$recipeDetails.name",
          cuisineRegion: "$recipeDetails.cuisineRegion",
          religiousRestriction: "$recipeDetails.religiousRestriction",
          dietaryRestriction: "$recipeDetails.dietaryRestriction",
          totalLikes: 1,
        },
      },
    ];
    const trendingRecipes = await this.likesCollection
      .aggregate(pipeline)
      .toArray();
    return trendingRecipes;
  }

  async refreshTrendingRecipeCache() {
    const trendingRecipes = await this.getTrendingRecipes();

    // insert a single cache document in trending-recipes collection, using a fixed id "cache" so theres only 1 cache document at all times
    const cacheDoc = {
      _id: "cache",
      updatedAt: new Date(),
      recipes: topRatedRecipes,
    };
  }

  async getCachedTrendingRecipes() {}
}

export const trendingRecipeStore = new TrendingRecipeStore();
