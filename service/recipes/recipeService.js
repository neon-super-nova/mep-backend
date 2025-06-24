import { recipeStore } from "../../store/recipes/recipeStore.js";
import { topRatedRecipeStore } from "../../store/dashboard-recipes/topRatedRecipeStore.js";
import { trendingRecipeStore } from "../../store/dashboard-recipes/trendingRecipeStore.js";

class RecipeService {
  constructor() {
    this.recipeStore = recipeStore;
    this.topRatedRecipeStore = topRatedRecipeStore;
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

  // all GET methods for filtering

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
    // return await
  }
}

export const recipeService = new RecipeService();
