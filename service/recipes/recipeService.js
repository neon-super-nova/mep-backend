import { recipeStore } from "../../store/recipes/recipeStore.js";
import { topRatedRecipeStore } from "../../store/dashboard-recipes/topRatedRecipeStore.js";
import { trendingRecipeStore } from "../../store/dashboard-recipes/trendingRecipeStore.js";

class RecipeService {
  constructor() {
    this.recipeStore = recipeStore;
    this.topRatedRecipeStore = topRatedRecipeStore;
    this.trendingRecipeStore = trendingRecipeStore;
  }

  async addRecipe(newRecipe) {
    return await this.recipeStore.addRecipe(newRecipe);
  }

  async modifyRecipe(recipeId, userId, recipeFields, images, imageMap) {
    try {
      const isUpdated = await this.recipeStore.modifyRecipe(
        recipeId,
        userId,
        recipeFields,
        images,
        imageMap
      );
      return { success: isUpdated };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getRecipePictureCount(recipeId) {
    try {
      const count = await this.recipeStore.getRecipePictureCount(recipeId);
      return { success: true, count: count };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async deleteRecipe(recipeId, userId) {
    const isDeleted = await this.recipeStore.deleteRecipe(recipeId, userId);
    if (!isDeleted) {
      return {
        success: false,
        message: "No matching recipe found or delete failed.",
      };
    }
    return { success: true };
  }

  async getAllRecipes() {
    try {
      return await this.recipeStore.getAllRecipes();
    } catch (err) {
      throw err;
    }
  }

  // all GET methods for filtering

  async searchRecipesWithFilters(filters) {
    const queryFilters = {};
    if (filters.name) {
      queryFilters.name = new RegExp(filters.name, "i");
    }
    if (filters.totalTime) {
      queryFilters.totalTime = { $lte: filters.totalTime };
    }
    if (filters.servings) {
      queryFilters.servings = { $lte: filters.servings };
    }
    if (filters.ingredients) {
      const ingredientList = filters.ingredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

      queryFilters.ingredients = {
        $all: ingredientList.map((ingredient) => new RegExp(ingredient, "i")),
      };
    }
    if (filters.cuisineRegion) {
      queryFilters.cuisineRegion = new RegExp(filters.cuisineRegion, "i");
    }
    if (filters.cuisineSubregion) {
      queryFilters.cuisineSubregion = new RegExp(filters.cuisineSubregion, "i");
    }
    if (filters.proteinChoice) {
      queryFilters.proteinChoice = new RegExp(filters.proteinChoice, "i");
    }
    if (filters.dietaryRestriction) {
      queryFilters.dietaryRestriction = new RegExp(
        filters.dietaryRestriction,
        "i"
      );
    }
    if (filters.religiousRestriction) {
      queryFilters.religiousRestriction = new RegExp(
        filters.religiousRestriction,
        "i"
      );
    }
    try {
      return await this.recipeStore.searchRecipesWithFilters(queryFilters);
    } catch (err) {
      throw err;
    }
  }

  async searchRecipeByName(name) {
    try {
      return await this.recipeStore.searchRecipeByName(name);
    } catch (err) {
      throw err;
    }
  }

  //

  async getRecipeById(recipeId) {
    try {
      return await this.recipeStore.getRecipeById(recipeId);
    } catch (err) {
      if (err.message === "RECIPE_NOT_FOUND") {
        return { error: "Recipe does not exist" };
      }
      throw err;
    }
  }

  // dashboard recipes
  async getTopRatedRecipes() {
    return await this.topRatedRecipeStore.getCachedTopRatedRecipes();
  }

  async getTrendingRecipes() {
    return await this.trendingRecipeStore.getCachedTrendingRecipes();
  }
}

export const recipeService = new RecipeService();
