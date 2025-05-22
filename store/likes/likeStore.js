import { likeCollection } from "./likeSchema.js";
import { getDatabase } from "../database.js";

class LikeStore {
  constructor() {
    this.collection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection(likeCollection);
  }

  // like a recipe
  async likeRecipe() {}

  // unlike a recipe
  async unlikeRecipe() {}
}

export const likeStore = new LikeStore();
