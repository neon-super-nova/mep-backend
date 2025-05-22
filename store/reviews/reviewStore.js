import { reviewCollection } from "./reviewSchema.js";
import { getDatabase } from "../database.js";

class ReviewStore {
  constructor() {
    this.collection = null;
  }

  init() {
    const db = getDatabase();
    this.collection = db.collection(reviewCollection);
  }
  // add a review (rating, comment)
}

export const reviewStore = new ReviewStore();
