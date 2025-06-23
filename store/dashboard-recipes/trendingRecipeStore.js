import { getDatabase } from "../database";

class TrendingRecipeStore {
  constructor() {
    this.collection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection("trending-recipes");
    this.recipeCollection = db.collection("recipes");
    this.recipeStatsCollection = db.collection("likes");
  }

  async getTrendingRecipes() {
    // trending recipes means = most liked recipes within the past week
    const now = new Date();
    const pastWeek = new Date(now);
    pastWeek.setDate(pastWeek.getDate - 7);

    const recentlyLikedRecipes = await this.recipeCollection.aggregate({
      createdAt: { $lt: pastWeek },
    });
  }
}
