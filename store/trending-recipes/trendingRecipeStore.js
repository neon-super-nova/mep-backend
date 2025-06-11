import { getDatabase } from "../database.js";

class TrendingRecipeStore {
  constructor() {
    this.collection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection("trending-recipes");
    this.recipeCollection = db.collection("recipes");
  }

  //trending recipe functions

  async getTrendingRecipes() {
    // calculate trending recipes using weighted rating and return top 2
  }

  async refreshCache() {
    // recalculate and store the trending recipes in mongodb for later retrieval
  }

  async getCachedTrendingRecipes() {
    // fetch tredning recipes from cache
  }
}

export const trendingRecipeStore = new TrendingRecipeStore();
