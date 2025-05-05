import { recipeCollection } from "./recipeSchema";
import { getDatabase } from "../database";

class RecipeStore {
  constructor() {
    this.collection = null;
  }
  init() {
    const db = getDatabase();
    this.collection = db.collection(recipeCollection);
  }

  /* methods here:

  async addRecipe(newRecipe){
    insertOne()
  }

  async getRecipeByName(recipeName){
    findOne()
  }
  
  async updateRecipe(recipeId, recipeFields){
    const objectId = ObjectId.createFromHex(recipeId);
    use this objectId to find the recipe and update with the fields specified
    update inputted fields
  }

  async deleteRecipe(){
    deleteOne()
  }
  */
}

export const recipeStore = new RecipeStore();
