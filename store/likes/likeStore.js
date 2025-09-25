import { likeCollection } from "./likeSchema.js";
import { getDatabase } from "../database.js";
import { ObjectId } from "mongodb";

class LikeStore {
  constructor() {
    this.collection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection(likeCollection);
    this.recipeCollection = db.collection("recipes");
    this.recipeStatsCollection = db.collection("recipeStats");
  }

  async checkForRecipeId(recipeId) {
    const id = new ObjectId(recipeId);
    return Boolean(await this.recipeCollection.findOne({ _id: id }));
  }

  async checkForLike(userId, recipeId) {
    if ((await this.checkForRecipeId(recipeId)) === false) {
      throw new Error("RECIPE_NOT_FOUND");
    }
    return Boolean(await this.collection.findOne({ userId, recipeId }));
  }

  async likeRecipe(userId, recipeId) {
    const recipeCheck = await this.checkForRecipeId(recipeId);
    if (!recipeCheck) {
      throw new Error("RECIPE_NOT_FOUND");
    }

    const alreadyLiked = await this.checkForLike(userId, recipeId);
    if (alreadyLiked) {
      // unlike the recipe (aka delete the like)
      await this.collection.deleteOne({ userId, recipeId });
      await this.recipeStatsCollection.updateOne(
        { recipeId },
        { $inc: { likeCount: -1 } }
      );
      return { success: true, status: "Recipe unliked" };
    } else {
      await this.collection.insertOne({
        userId: userId,
        recipeId: recipeId,
        createdAt: new Date(),
      });
      await this.recipeStatsCollection.updateOne(
        { recipeId },
        { $inc: { likeCount: 1 } },
        { upsert: true }
      );
      return { success: true, status: "Recipe liked" };
    }
  }

  async recalculateLikeStats(recipeId) {
    const numOfLikes = await this.collection.countDocuments({ recipeId });
    await this.recipeStatsCollection.update(
      { recipeId },
      {
        $set: {
          likeCount: numOfLikes,
        },
      },
      { upsert: true }
    );
  }

  async deleteLikesByUser(userId) {
    const likesByUser = await this.collection.find({ userId }).toArray();
    const recipesLikedByUser = [
      ...new Set(likesByUser.map((like) => like.recipeId)),
    ];
    if (recipesLikedByUser.length === 0) {
      return;
    }
    await this.collection.deleteMany({ userId });

    for (const recipe of recipesLikedByUser) {
      await this.recalculateLikeStats(recipe);
    }
  }
}

export const likeStore = new LikeStore();
