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
    this.reviewsCollection = db.collection("reviews");
    this.likesCollection = db.collection("likes");
    this.recipeStatsCollection = db.collection("recipeStats");
    this.notificationCollection = db.collection("notifications");
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

  async modifyRecipe(recipeId, userId, recipeFields = {}, images, imageMap) {
    const id = new ObjectId(recipeId);
    const recipe = await this.collection.findOne({ _id: id });

    if (!recipe) {
      throw new Error("No recipe found");
    }
    if (recipe.userId !== userId) {
      throw new Error("You are not the owner of this recipe.");
    }

    const currImages = recipe.imageUrls || [];

    if (images.length > 0 && imageMap.length > 0) {
      let i = 0;

      for (let index = 0; index < imageMap.length; index++) {
        const slot = imageMap[index];

        // Only update slots marked as replaced
        if (!slot.replaced) continue;

        if (!images[i]) {
          throw new Error(`Image index mismatch at index ${index}`);
        }

        currImages[index] = images[i];
        i++;
      }

      recipeFields.imageUrls = currImages.slice(0, 3); // ensure max 3
    }
    // updating total time if changes in cooktime or preptime
    if ("cookTime" in recipeFields || "prepTime" in recipeFields) {
      const recipe = await this.collection.findOne({ _id: id });
      const newCookTime = recipeFields.cookTime ?? recipe.cookTime ?? 0;
      const newPrepTime = recipeFields.prepTime ?? recipe.prepTime ?? 0;
      recipeFields.totalTime = newCookTime + newPrepTime;
    }

    // Update the document (text fields + possibly imageUrls)
    const result = await this.collection.updateOne(
      { _id: id, userId: userId },
      { $set: recipeFields }
    );

    if (result.matchedCount === 0) {
      throw new Error("No matching recipe found or nothing was updated.");
    }

    return result.modifiedCount > 0;
  }

  async getRecipePictureCount(recipeId) {
    const id = new ObjectId(recipeId);
    const recipe = await this.collection.findOne({ _id: id });
    if (!recipe) {
      throw new Error("No recipe found");
    }
    const pictureUrlCount = recipe.imageUrls.length;
    return pictureUrlCount;
  }

  async deleteRecipe(recipeId, userId) {
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

  async searchRecipesWithFilters(queryFilters) {
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
      return [];
    }
    return recipes;
  }

  async searchRecipeByName(name) {
    const foundRecipes = await this.collection
      .aggregate([
        {
          $match: {
            name: { $regex: new RegExp(name, "i") },
          },
        },
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
        { $unwind: "$recipeAuthor" },
        {
          $project: {
            _id: 1,
            name: 1,
            imageUrls: 1,
            authorName: {
              $concat: [
                "$recipeAuthor.firstName",
                " ",
                "$recipeAuthor.lastName",
              ],
            },
          },
        },
      ])
      .toArray();

    if (foundRecipes === 0) {
      return [];
    }

    return foundRecipes;
  }

  //

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

  async deleteRecipe(recipeId) {
    const recipe = await this.collection.findOne({
      _id: new ObjectId(recipeId),
    });
    if (!recipe) {
      throw new Error("RECIPE_NOT_FOUND");
    }
    // delete recipeStats doc for this recipeId, reviews, likes, notifications
    await this.reviewsCollection.deleteMany({ recipeId });
    await this.likesCollection.deleteMany({ recipeId });
    await this.recipeStatsCollection.deleteOne({ recipeId });
    await this.notificationCollection.deleteMany({ recipeId });
    // and finally delete recipe doc itself
    await this.collection.deleteOne({ _id: new ObjectId(recipeId) });
  }

  async deleteAllRecipesByUser(userId) {
    const userRecipes = await this.collection.find({ userId }).toArray();
    const count = 0;
    for (const recipe of userRecipes) {
      await this.deleteRecipe(recipe._id.toString());
      count += 1;
    }
  }
}

export const recipeStore = new RecipeStore();
