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

  async updateRecipe(recipeId, userId, recipeFields) {
    try {
      const isUpdated = await this.recipeStore.updateRecipe(
        recipeId,
        userId,
        recipeFields
      );
      return { success: isUpdated };
    } catch (error) {
      return { success: false, message: error.message };
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

  async updateRecipeImage(userId, recipeId, imageUrl) {
    try {
      return await this.recipeStore.updateRecipeImage(
        userId,
        recipeId,
        imageUrl
      );
    } catch (err) {
      if (err.message === "RECIPE_NOT_FOUND_OR_FORBIDDEN") {
        return { error: "Recipe not found or forbidden action" };
      }
      throw err;
    }
  }

  async getAllRecipes() {
    try {
      return await this.recipeStore.getAllRecipes();
    } catch (err) {
      throw err;
    }
  }

  // all GET methods for filtering

  async searchRecipes(filters) {
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
      return await this.recipeStore.searchRecipes(queryFilters);
    } catch (err) {
      if (err.message === "RECIPE_NOT_FOUND") {
        return { error: "Recipes not found" };
      }
      throw err;
    }
  }

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

  async getRecipeByName(regex) {
    return await this.recipeStore.collection
      .find({ name: { $regex: regex } })
      .toArray();
  }

  async getRecipeByIngredients(regex) {
    return await this.recipeStore.collection
      .find({
        ingredients: { $elemMatch: { $regex: regex } },
      })
      .toArray();
  }

  async getRecipeByCuisineRegion(regex) {
    return await this.recipeStore.collection
      .find({ cuisineRegion: { $regex: regex } })
      .toArray();
  }

  async getRecipeByProteinChoice(regex) {
    return await this.recipeStore.collection
      .find({
        proteinChoice: { $regex: regex },
      })
      .toArray();
  }

  async getRecipeByDietaryRestriction(regex) {
    return await this.recipeStore.collection
      .find({
        dietaryRestriction: {
          $regex: regex,
        },
      })
      .toArray();
  }

  async getRecipeByReligiousRestriction(regex) {
    return await this.recipeStore.collection
      .find({ religiousRestriction: { $regex: regex } })
      .toArray();
  }

  async getRecipesByUser(userId) {
    return await this.recipeStore.getRecipesByUser(userId);
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
