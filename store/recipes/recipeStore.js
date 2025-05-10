import { recipeCollection } from "./recipeSchema.js";
import { getDatabase } from "../database.js";
import { ObjectId } from "mongodb";
class RecipeStore {
  constructor() {
    this.collection = null;
  }
  init() {
    const db = getDatabase();
    this.collection = db.collection(recipeCollection);
  }

  async addRecipe(newRecipe) {
    const result = await this.collection.insertOne({
      userId: newRecipe.userId,
      name: newRecipe.name,
      ingredients: newRecipe.ingredients,
      instructions: newRecipe.instructions,
      imageUrl: newRecipe.imageUrl,
      cuisineRegion: newRecipe.cuisineRegion,
      proteinChoice: newRecipe.proteinChoice,
      dietaryRestriction: newRecipe.dietaryRestriction,
      religiousRestriction: newRecipe.religiousRestriction,
    });

    if (!result.insertedId) {
      throw new Error("Failed to add recipe" + err.message);
    }
    return result.insertedId;
  }

  async getRecipeByName(recipeName) {
    const recipe = await this.collection.findOne({ name: recipeName });
    if (!recipe) {
      throw new Error("no results" + err.message);
    }
    return recipe || null;
  }

  async getRecipeByIngredients(recipeIngredient) {
    const recipe = await this.collection.findOne({
      ingredients: recipeIngredient,
    });
    if (!recipe) {
      throw new Error("no results" + err.message);
    }
    return recipe || null;
  }

  async getRecipeByCuisineRegion(recipeRegion) {
    const recipe = await this.collection.findOne({
      cuisineRegion: recipeRegion,
    });
    if (!recipe) {
      throw new Error("no results" + err.message);
    }
    return recipe || null;
  }

  async getRecipeByProteinChoice(recipeProtein) {
    const recipe = await this.collection.findOne({
      proteinChoice: recipeProtein,
    });
    if (!recipe) {
      throw new Error("no results" + err.message);
    }
    return recipe || null;
  }

  async getRecipeByDietaryRestriction(recipeDiet) {
    const recipe = await this.collection.findOne({
      dietaryRestriction: recipeDiet,
    });
    if (!recipe) {
      throw new Error("no results" + err.message);
    }
    return recipe || null;
  }

  async getRecipeByReligiousRestriction(recipeReligion) {
    const recipe = await this.collection.findOne({
      religiousRestriction: recipeReligion,
    });
    if (!recipe) {
      throw new Error("no results" + err.message);
    }
    return recipe || null;
  }

  async updateRecipe(recipeId, recipeFields) {
    const objectId = ObjectId.createFromHex(recipeId);
    const result = await this.collection.updateOne(
      { _id: objectId },
      { $set: recipeFields }
    );
    if (!recipeId) {
      throw new Error("Failed to update recipe: " + err.message);
    }
    return result.modifiedCount > 0;
  }

  async deleteRecipe(recipeId) {
    const objectId = ObjectId.createFromHex(recipeId);
    const result = await this.collection.deleteOne({ _id: objectId });
    if (!recipeId) {
      return "no results";
    }
    return result.deletedCount > 0;
  }
}

export const recipeStore = new RecipeStore();

/*  const objectId = ObjectId.createFromHex(recipeId);
    use this objectId to find the recipe and update with the fields specified
    update inputted fields
*/
