import { ObjectId } from "mongodb";

export const recipeCollection = "recipes";

export const recipeSchema = {
  // no need to assign a userId, mongoDb is already assigning one as { _id }
  userId: ObjectId,
  name: String,
  ingredients: [String],
  instructions: [String],
  imageUrl: { type: String, required: false },
  cuisineRegion: {
    type: String,
    enum: [
      "Latin American",
      "Caribbean",
      "North American",
      "Middle Eastern",
      "East Asian",
      "South Asian",
      "European",
      "African",
      "Hawaiian/Pacific Islands",
      "Other",
    ],
    required: true,
  },
  proteinChoice: {
    type: String,
    enum: [
      "Plant-based",
      "Egg",
      "Chicken",
      "Fish",
      "Shelfish",
      "Beef",
      "Pork",
      "Lamb",
      "Other animal based",
    ],
    required: true,
  },
  dietaryRestriction: {
    type: String,
    enum: [
      "Vegan",
      "Vegetarian",
      "Pescatarian",
      "Nut-free",
      "Gluten-free",
      "Dairy-free",
      "Shelfish-free",
      "Paleo",
      "Keto",
      "Low-carb",
    ],
    required: false,
  },
  religiousRestriction: {
    type: String,
    enum: ["Halal", "Kosher", "Kosher Parve", "Hindu"],
    required: false,
    default: "None",
  },
};
