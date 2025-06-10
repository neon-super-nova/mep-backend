import { recipeCollection } from "./recipeSchema.js";
import { getDatabase } from "../database.js";
import { ObjectId, ReturnDocument } from "mongodb";

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
      totalTime: Number(newRecipe.prepTime + newRecipe.cookTime),
      servings: Number(newRecipe.servings),
      ingredients: newRecipe.ingredients,
      instructions: newRecipe.instructions,
      imageUrl: newRecipe.imageUrl,
      cuisineRegion: newRecipe.cuisineRegion,
      proteinChoice: newRecipe.proteinChoice,
      dietaryRestriction: newRecipe.dietaryRestriction,
      religiousRestriction: newRecipe.religiousRestriction,
      totalLikes: 0,
      totalReviews: 0,
      averageRating: 0,
      createdAt: new Date(),
    });

    if (!result.insertedId) {
      throw new Error("Failed to add recipe" + err.message);
    }
    return result.insertedId;
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

  async updateRecipeImage(userId, recipeId, imageUrl) {
    try {
      const id = new ObjectId(recipeId);

      const foundRecipe = await this.collection.findOne({ _id: id, userId });

      if (!foundRecipe) {
        throw new Error("RECIPE_NOT_FOUND_OR_FORBIDDEN");
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: id, userId },
        { $set: { imageUrl } },
        { returnDocument: "after" }
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  // all GET methods for filtering

  async getRecipeById(recipeId) {
    const id = new ObjectId(recipeId);
    const recipe = await this.collection.findOne({ _id: id });
    if (!recipe) {
      throw new Error("RECIPE_NOT_FOUND");
    }
    return recipe;
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

  // like and unlike methods
  async incrementLikes(recipeId) {
    await this.collection.updateOne(
      { _id: new ObjectId(recipeId) },
      { $inc: { totalLikes: 1 } }
    );
  }

  async decrementLikes(recipeId) {
    await this.collection.updateOne(
      { _id: new ObjectId(recipeId) },
      { $inc: { totalLikes: -1 } }
    );
  }

  //trending recipe functions

  async calculateGlobalAverageRating() {
    // calculate average rating of all recipes with at least 1 review (value C)
    // based on imdb c calculation
  }

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

export const recipeStore = new RecipeStore();
