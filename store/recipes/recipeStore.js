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
      description: newRecipe.description,
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

  async getAllRecipes() {
    const pipeline = [
      {
        $lookup: {
          from: "users",
          let: { userIdStr: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$userIdStr" }],
                },
              },
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
              },
            },
          ],
          as: "recipeAuthor",
        },
      },
      {
        $unwind: "$recipeAuthor",
      },
      {
        $project: {
          _id: 1,
          name: 1,
          imageUrl: 1,
          authorName: {
            $concat: ["$recipeAuthor.firstName", " ", "$recipeAuthor.lastName"],
          },
        },
      },
    ];

    const recipes = await this.collection.aggregate(pipeline).toArray();
    return recipes;
  }

  // all GET methods for filtering

  async searchRecipes(queryFilters) {
    const pipeline = [];
    if (Object.keys(queryFilters).length > 0) {
      pipeline.push({ $match: queryFilters });
    }

    pipeline.push({
      $lookup: {
        from: "users",
        let: { userIdStr: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", { $toObjectId: "$$userIdStr" }],
              },
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
            },
          },
        ],
        as: "recipeAuthor",
      },
    });

    pipeline.push({ $unwind: "$recipeAuthor" });

    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        imageUrl: 1,
        authorName: {
          $concat: ["$recipeAuthor.firstName", " ", "$recipeAuthor.lastName"],
        },
      },
    });

    const recipes = await this.collection.aggregate(pipeline).toArray();

    if (recipes.length === 0) {
      throw new Error("RECIPE_NOT_FOUND");
    }
    return recipes;
  }

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
}

export const recipeStore = new RecipeStore();
