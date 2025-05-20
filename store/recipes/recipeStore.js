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
      prepTime: Number(newRecipe.prepTime),
      cookTime: Number(newRecipe.cookTime),
      totalTime: Number(newRecipe.totalTime),
      servings: Number(newRecipe.servings),
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

  async getRecipesByUser(userId) {
    return await this.collection
      .find({ userId: new ObjectId(String(userId)) })
      .toArray();
  }

  async getRecipeByName(recipeName) {
    const recipe = await this.collection.findOne({ name: recipeName });
    return recipe || null;
  }

  async getRecipeByIngredients(recipeIngredient) {
    const recipe = await this.collection.findOne({
      ingredients: recipeIngredient,
    });
    return recipe || null;
  }

  async getRecipeByCuisineRegion(recipeRegion) {
    const recipe = await this.collection.findOne({
      cuisineRegion: recipeRegion,
    });
    return recipe || null;
  }

  async getRecipeByProteinChoice(recipeProtein) {
    const recipe = await this.collection.findOne({
      proteinChoice: recipeProtein,
    });
    return recipe || null;
  }

  async getRecipeByDietaryRestriction(recipeDiet) {
    const recipe = await this.collection.findOne({
      dietaryRestriction: recipeDiet,
    });
    return recipe || null;
  }

  async getRecipeByReligiousRestriction(recipeReligion) {
    const recipe = await this.collection.findOne({
      religiousRestriction: recipeReligion,
    });
    return recipe || null;
  }

  async updateRecipe(recipeId, userId, recipeFields) {
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("Invalid recipeId");
    }

    const objectId = new ObjectId(recipeId);

    const result = await this.collection.updateOne(
      { _id: objectId, userId: userId }, // userId as string
      { $set: recipeFields }
    );

    if (result.matchedCount === 0) {
      throw new Error("No matching recipe found or nothing was updated.");
    }

    return result.modifiedCount > 0;
  }

  async deleteRecipe(recipeId, userId) {
    if (!ObjectId.isValid(recipeId)) {
      throw new Error("Invalid recipeId");
    }

    const objectId = new ObjectId(recipeId);

    const result = await this.collection.deleteOne({
      _id: new ObjectId(recipeId),
      userId: userId,
    });

    return result.deletedCount > 0;
  }
}

export const recipeStore = new RecipeStore();

/*  const objectId = ObjectId.createFromHex(recipeId);
    use this objectId to find the recipe and update with the fields specified
    update inputted fields

    also: 

    function formatTime(minutes) {
      if (minutes < 60) {
        return { minutes };
      } else {
        return {
          hours: Math.floor(minutes / 60),
          minutes: minutes % 60
        };
      }
    }
    
    might need in front end to format the time
*/
