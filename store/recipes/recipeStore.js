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
      prepTime: newRecipe.prepTime,
      cookTime: newRecipe.cookTime,
      totalTime: newRecipe.prepTime + newRecipe.cookTime,
      servings: newRecipe.servings,
      ingredients: newRecipe.ingredients,
      instructions: newRecipe.instructions,
      imageUrls: newRecipe.imageUrls,
      cuisineRegion: newRecipe.cuisineRegion,
      cuisineSubregion: newRecipe.cuisineSubregion,
      proteinChoice: newRecipe.proteinChoice,
      dietaryRestriction: newRecipe.dietaryRestriction,
      religiousRestriction: newRecipe.religiousRestriction,
      authorNotes: newRecipe.authorNotes,
      equipment: newRecipe.equipment,
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
          imageUrls: 1,
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
        imageUrls: 1,
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
}

export const recipeStore = new RecipeStore();
