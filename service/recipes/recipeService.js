import { recipeStore } from "../../store/recipes/recipeStore.js";

class RecipeService {
  constructor() {
    this.recipeStore = recipeStore;
  }

  async addRecipe(newRecipe) {
    return await this.recipeStore.addRecipe(newRecipe);
  }

  async getRecipeByName(recipeName) {
    return await this.recipeStore.getRecipeByName(recipeName);
  }

  async getRecipeByIngredients(regex) {
    return await this.recipeStore.collection
      .find({
        ingredients: { $elemMatch: { $regex: regex } },
      })
      .toArray();
  }

  async getRecipeByCuisineRegion(recipeRegion) {
    return await this.recipeStore.getRecipeByCuisineRegion(recipeRegion);
  }

  async getRecipeByProteinChoice(recipeProtein) {
    return await this.recipeStore.getRecipeByProteinChoice(recipeProtein);
  }

  async getRecipeByDietaryRestriction(recipeDiet) {
    return await this.recipeStore.getRecipeByDietaryRestriction(recipeDiet);
  }

  async getRecipeByReligiousRestriction(recipeReligion) {
    return await this.recipeStore.getRecipeByReligiousRestriction(
      recipeReligion
    );
  }

  async getRecipesByUser(userId) {
    return await this.recipeStore.getRecipesByUser(userId);
  }

  async updateRecipe(recipeId, userId, recipeFields) {
    const isUpdated = await this.recipeStore.updateRecipe(
      recipeId,
      userId,
      recipeFields
    );
    return { success: isUpdated };
  }

  async deleteRecipe(recipeId, userId) {
    const isDeleted = await this.recipeStore.deleteRecipe(recipeId, userId);
    return { success: isDeleted };
  }
}

export const recipeService = new RecipeService();
