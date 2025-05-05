import { recipeStore } from "../../store/recipes/recipeStore";

class RecipeService {
  constructor() {
    this.recipeStore = recipeStore;
  }

  /*
  methods:

  async addRecipe(newRecipe){
    await this.recipeStore.addRecipe(newRecipe);
  }

  async getRecipe(recipeName){
    await this.recipeStore.getRecipe(recipeName);
  }

  async updateRecipe(recipeId, recipeFields){
    const isUpdated = this.recipeStore.updateRecipe(recipeId, recipeFields);
    if (isUpdated){
      return {success: true};
    } else {
     return {success: false};
    }
  }

  async deleteRecipe(recipeId){
    const isDeleted = this.recipeStore.deleteRecipe(recipeId);
    if (isDeleted){
      return {success: true}
    } else {
     return {success: false}
    }
  }
   */
}

export const recipeService = new RecipeService();
